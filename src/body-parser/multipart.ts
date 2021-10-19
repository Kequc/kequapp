import Ex from '../util/ex';
import headerAttributes from '../util/header-attributes';

import { RawPart } from '../../types/body-parser';

const CRLF = [0x0d, 0x0a];

function multipart (buffer: Buffer, contentType?: string): RawPart[] {
    if (!contentType?.startsWith('multipart/')) {
        throw Ex.UnprocessableEntity('Unable to process request', {
            contentType
        });
    }

    const boundary = getBoundary(contentType);
    const result: RawPart[] = [];

    let headers: { [key: string]: string } = {};
    let i = findNextLine(buffer, buffer.indexOf(boundary, 0));

    function addHeader (nextLine: number) {
        const line = buffer.slice(i, nextLine).toString();
        const parts = line.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts[1]?.trim();
        if (key && value) headers[key] = value;
    }

    function addPart (boundaryAt: number) {
        const dataEnd = boundaryAt - crlfLength(buffer, boundaryAt-2);
        result.push({
            headers,
            data: buffer.slice(i, dataEnd)
        });
    }

    while (i > -1) {
        // until two new lines
        while (i > -1 && !CRLF.includes(buffer[i])) {
            const nextLine = findNextLine(buffer, i);
            if (nextLine > -1) addHeader(nextLine);

            i = nextLine;
        }

        if (i <= -1) break;
        i += crlfLength(buffer, i);
        if ((i + 2) >= buffer.length) break;

        // data start
        const boundaryAt = buffer.indexOf(boundary, i);
        if (boundaryAt <= -1) break;
        addPart(boundaryAt);

        i = findNextLine(buffer, boundaryAt);
        headers = {};
    }

    return result;
}

export default multipart;

function getBoundary (contentType: string) {
    const boundary = headerAttributes(contentType).boundary;
    if (!boundary) {
        throw Ex.UnprocessableEntity('Multipart request requires boundary attribute', {
            contentType
        });
    }
    return `--${boundary}`;
}

function findNextLine (buffer: Buffer, from: number) {
    const ii = CRLF.map(char => buffer.indexOf(char, from)).filter(i => i > -1);
    if (ii.length < 1) return -1;
    const i = Math.min(...ii);
    if ((i + 2) >= buffer.length) return -1;
    return i + crlfLength(buffer, i);
}

function crlfLength (buffer: Buffer, from: number) {
    const isCrlf = buffer[from] === CRLF[0] && buffer[from + 1] === CRLF[1];
    return isCrlf ? 2 : 1;
}

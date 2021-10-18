import Ex from '../util/ex';
import headerAttributes from '../util/header-attributes';

import { RawPart } from '../../types/body-parser';

const NEW_LINE = [0x0a, 0x0d];

function multipart (buffer: Buffer, contentType?: string): RawPart[] {
    if (!contentType?.startsWith('multipart/')) {
        throw Ex.UnprocessableEntity('Unable to process request', {
            contentType
        });
    }

    const boundary = getBoundary(contentType);
    const result: RawPart[] = [];

    let headers: { [key: string]: string } = {};
    let index = findNextLine(buffer, buffer.indexOf(boundary, 0));

    function addHeader (line: string) {
        const parts = line.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts[1]?.trim();

        if (key && value) headers[key] = value;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const lineEnd = findLineEnd(buffer, index);
            if (lineEnd === index) {
                // two newlines in a row
                index = findNextLine(buffer, lineEnd);
                break;
            }
            const line = buffer.slice(index, lineEnd).toString();
            addHeader(line);
            index = findNextLine(buffer, lineEnd);

            if (index <= -1) break; // eof
        }

        if (index <= -1) break; // eof

        const boundaryAt = buffer.indexOf(boundary, index);
        const isRn = checkIsRn(buffer, boundaryAt - 2);
        const dataEnd = boundaryAt - (isRn ? 2 : 1);

        result.push({
            headers,
            data: buffer.slice(index, dataEnd)
        });

        headers = {};
        index = findNextLine(buffer, boundaryAt);

        if (index <= -1) break; // eof
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

function findLineEnd (buffer: Buffer, from: number) {
    const indexes = NEW_LINE
        .map(char => buffer.indexOf(char, from))
        .filter(i => i > -1);
    if (indexes.length < 1) return buffer.length - 1;
    if (indexes.length === 1) return indexes[0];
    return Math.min(...indexes);
}

function checkIsRn (buffer: Buffer, from: number) {
    // \r\n?
    const char = buffer[from];
    const nextChar = buffer[from + 1];
    return NEW_LINE.includes(char) && NEW_LINE.includes(nextChar) && buffer[from] !== nextChar;
}

function findNextLine (buffer: Buffer, from: number) {
    const lineEnd = findLineEnd(buffer, from);
    if (lineEnd === -1 || (lineEnd + 2) >= buffer.length) return -1;
    return lineEnd + (checkIsRn(buffer, lineEnd) ? 2 : 1);
}

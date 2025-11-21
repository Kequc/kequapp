import Ex from '../../built-in/tools/ex.ts';
import type { Params, RawPart } from '../../types.ts';
import headerAttributes from '../../util/header-attributes.ts';

const CR = 0x0d;
const LF = 0x0a;

export default function splitMultipart(body: RawPart): RawPart[] {
    const contentType = body.headers['content-type'];

    if (!contentType?.startsWith('multipart/')) {
        throw Ex.BadRequest('Unable to process request', {
            contentType,
        });
    }

    const boundary = extractBoundary(contentType);
    const buffer = body.data;
    const result: RawPart[] = [];

    let headers: Params = {};
    let i = findNextLine(buffer, buffer.indexOf(boundary, 0));

    function addHeader(nextLine: number) {
        const line = buffer.slice(i, nextLine).toString();
        const parts = line.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts[1]?.trim();
        if (key && value) headers[key] = value;
    }

    function addPart(nextBoundary: number) {
        const dataEnd =
            nextBoundary - (buffer[nextBoundary - 2] === CR ? 2 : 1);
        result.push({
            headers,
            data: buffer.slice(i, dataEnd),
        });
        headers = {};
    }

    while (i > -1) {
        // until two new lines
        while (i > -1 && buffer[i] !== CR && buffer[i] !== LF) {
            const nextLine = findNextLine(buffer, i);
            if (nextLine > -1) addHeader(nextLine);

            i = nextLine;
        }

        if (i < 0) break;
        i += buffer[i] === CR ? 2 : 1;
        if (i >= buffer.length) break;

        // data start
        const nextBoundary = buffer.indexOf(boundary, i);
        if (nextBoundary < 0) break;
        addPart(nextBoundary);

        i = findNextLine(buffer, nextBoundary);
    }

    return result;
}

function extractBoundary(contentType: string) {
    const boundary = headerAttributes(contentType).boundary;
    if (!boundary) {
        throw Ex.BadRequest('Multipart request requires boundary attribute', {
            contentType,
        });
    }
    return `--${boundary}`;
}

function findNextLine(buffer: Buffer, from: number) {
    const i = buffer.indexOf(LF, from) + 1;
    if (i < 1 || i >= buffer.length) return -1;
    return i;
}

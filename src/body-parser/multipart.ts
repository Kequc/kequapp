import errors from "../util/errors";

import { RawBodyPart } from "../../types/body-parser";

function multipart (buffer: Buffer, contentType?: string) {
    const boundary = getParts(contentType).boundary;
    if (!boundary) {
        throw errors.UnprocessableEntity('Multipart request requires boundary', { contentType });
    }

    const parts: RawBodyPart[] = [];
    const start = readUntilBoundary(buffer, boundary, 0);
    let currentIndex = start.endIndex;

    while (currentIndex < buffer.length) {
        const headers = readHeaders(buffer, currentIndex);
        currentIndex = headers.endIndex;

        if (!headers.found) {
            break;
        }

        const body = readUntilBoundary(buffer, boundary, currentIndex);
        currentIndex = body.endIndex;

        parts.push({
            filename: parseFilename(headers.contentDisposition),
            contentType: parseContentType(headers.contentType),
            data: [Buffer.from(body.data)]
        });
    }

    return parts;
}

export default multipart;

function getParts (contentType = '') {
    const parts = contentType.split(';').slice(1);
    const result: { [key: string]: string } = {};
    for (const part of parts) {
        const [key, ...values] = part.split('=');
        result[key.toLowerCase().trim()] = values.join('=').trim();
    }
    return result;
}

function readHeaders (buffer: Buffer, startIndex: number) {
    let line = '';
    let contentDisposition = '';
    let contentType = '';
    let found = false;
    let index = startIndex;

    for (; index < buffer.length; index++) {
        const [byte, newLineDetected, newLineChar] = getByte(buffer, index);

        if (!newLineChar) {
            line += String.fromCharCode(byte);
        }

        if (newLineDetected) {
            const key = line.split(':')[0].trim().toLowerCase()

            if (key === '') {
                break;
            }

            found = true;
            switch (key) {
            case 'content-disposition':
                contentDisposition = line;
                break;
            case 'content-type':
                contentType = line;
                break;
            default:
                break;
            }
            line = '';
        }
    }

    return {
        contentDisposition,
        contentType,
        endIndex: index + 1,
        found
    }
}

function readUntilBoundary (buffer: Buffer, boundary: string, startIndex: number) {
    const data: number[] = [];
    let line = '';
    let index = startIndex;

    for (; index < buffer.length; index++) {
        const [byte, newLineDetected, newLineChar] = getByte(buffer, index);

        if (!newLineChar) {
            line += String.fromCharCode(byte);
        }

        if (line.length > boundary.length + 4) {
            line = ''; // mem happy
        }

        if ('--' + boundary == line) {
            break;
        } else {
            data.push(byte);
        }

        if (newLineDetected) {
            line = '';
        }
    }

    return {
        data: data.slice(0, data.length - line.length - 1),
        endIndex: index + 3 // include new line
    };
}

function getByte (buffer: Buffer, index: number): [number, boolean, boolean] {
    const byte = buffer[index];
    const prevByte = (index > 0 ? buffer[index - 1] : null);
    const newLineDetected = byte === 0x0a && prevByte === 0x0d ? true : false;
    const newLineChar = byte === 0x0a || byte === 0x0d ? true : false;

    return [byte, newLineDetected, newLineChar];
}

function parseFilename (contentDisposition: string): string | undefined {
    const filenames = contentDisposition
        .split(';')
        .map(parseAssignment)
        .filter(({ filename }) => !!filename);

    return filenames[0]?.filename || undefined;
}

function parseContentType (contentType: string): string | undefined {
    return contentType.split(":")[1]?.split(";")[0]?.trim() || undefined;
}

function parseAssignment (assignment: string) {
    const result: { [key: string]: string } = {};
    const parts = assignment.split('='); // format a=b or a="b"

    if (parts.length == 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        try {
            result[key] = JSON.parse(value);
        } catch (error) {
            result[key] = value;
        }
    }

    return result;
}

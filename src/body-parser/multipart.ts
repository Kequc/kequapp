import errors from '../util/errors';
import { headerAttributes } from '../util/sanitize';

import { BodyPart } from '../../types/body-parser';

function multipart (buffer: Buffer, contentType?: string): BodyPart[] {
    if (!contentType?.startsWith('multipart/')) {
        throw errors.UnprocessableEntity('Unable to process request', {
            contentType
        });
    }

    const boundary = headerAttributes(contentType).boundary;
    if (!boundary) {
        throw errors.UnprocessableEntity('Multipart request requires boundary attribute', {
            contentType
        });
    }

    const parts: BodyPart[] = [];
    const start = readUntilBoundary(buffer, boundary, 0);
    let currentIndex = start.endIndex;

    while (currentIndex < buffer.length) {
        const headers = readHeaders(buffer, currentIndex);
        currentIndex = headers.endIndex;

        if (Object.entries(headers.found).length < 1) {
            break;
        }

        const attributes = headerAttributes(headers.found['content-disposition']);
        const body = readUntilBoundary(buffer, boundary, currentIndex);
        currentIndex = body.endIndex;

        parts.push({
            headers: headers.found,
            name: attributes.name,
            filename: attributes.filename,
            data: Buffer.from(body.data)
        });
    }

    return parts;
}

export default multipart;

function readHeaders (buffer: Buffer, startIndex: number) {
    const found: { [key: string]: string } = {};
    let line = '';
    let index = startIndex;

    for (; index < buffer.length; index++) {
        const [byte, newLineDetected, newLineChar] = getByte(buffer, index);

        if (!newLineChar) {
            line += String.fromCharCode(byte);
        }

        if (newLineDetected) {
            const parts = line.split(':');
            const key = parts[0].trim().toLowerCase();
            const value = parts[1]?.trim() || undefined;

            if (key === '') {
                break;
            }

            if (value) found[key] = value;
            line = '';
        }
    }

    return {
        found,
        endIndex: index + 1
    };
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

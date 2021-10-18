import Ex from '../util/ex';
import headerAttributes from '../util/header-attributes';

import { RawPart } from '../../types/body-parser';

const NEW_LINE = [0x0d, 0x0a];

function multipart (buffer: Buffer, contentType?: string): RawPart[] {
    if (!contentType?.startsWith('multipart/')) {
        throw Ex.UnprocessableEntity('Unable to process request', {
            contentType
        });
    }

    const boundary = getBoundary(contentType);
    const result: RawPart[] = [];

    let headers: { [key: string]: string } = {};
    let bytes: number[] = [];
    let isBody = false;
    let line = '';

    function reset () {
        headers = {};
        bytes = [];
        isBody = false;
        line = '';
    }

    function addHeader () {
        const parts = line.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts[1]?.trim();

        if (key && value) headers[key] = value;
    }

    function addPart () {
        const trash = boundary.length + 2; // new line before boundary

        if (bytes.length > trash) result.push({
            headers,
            data: Buffer.from(bytes.slice(0, bytes.length - trash))
        });
    }

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];

        if (!NEW_LINE.includes(byte)) {
            // if we're reading the body we don't need it
            if (!isBody || line.length < boundary.length) {
                line += String.fromCharCode(byte);
            }
        } else if (i > 0 && buffer[i - 1] === NEW_LINE[0]) {
            // new line detected
            if (!isBody) {
                if (line === '') {
                    // two new lines detected
                    reset();
                    isBody = true;
                    continue;
                } else {
                    addHeader();
                    reset();
                }
            }
            line = '';
        }

        if (isBody) {
            bytes.push(byte);
        }

        if (line === boundary) {
            // boundary detected
            addPart();
            reset();
            i += 2;
        }
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

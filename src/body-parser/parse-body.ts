import errors from '../util/errors';
import { sanitizeContentType } from '../util/sanitize';
import multipart from './multipart';

import { BodyPart, RawBodyPart } from '../../types/body-parser';

enum ContentType {
    URL_ENCODED = 'application/x-www-form-urlencoded',
    JSON = 'application/json',
    MULTIPART = 'multipart/form-data'
}

export function parseBody (body: BodyPart): BodyPart {
    return {
        ...body,
        data: parseBuffer(body)
    };
}

export function parseMultipart(raw: RawBodyPart) {
    if (sanitizeContentType(raw.contentType) === 'multipart/form-body') {
        return multipart(raw.data, raw.contentType).map(parseMultipart);
    }
    return raw;
}

function parseBuffer ({ data, contentType }: BodyPart): any {
    switch (sanitizeContentType(contentType)) {
    case ContentType.URL_ENCODED:
        return data.map(parseUrlEncoded);
    case ContentType.JSON:
        return data.map(parseJson);
    case ContentType.MULTIPART:
        return data.map(parseBuffer);
    default:
        return data;
    }
}

function parseUrlEncoded (buffer: Buffer): any {
    try {
        const params = new URLSearchParams(toString(buffer)!);
        const result: { [key: string]: any } = {};

        for (const key of params.keys()) {
            if (params.getAll(key).length > 1) {
                result[key] = params.getAll(key);
            } else {
                result[key] = params.get(key);
            }
        }

        return result;
    } catch (error) {
        throw errors.UnprocessableEntity('Unable to process request', {
            error
        });
    }
}

function parseJson (buffer: Buffer): any {
    try {
        return JSON.parse(toString(buffer)!);
    } catch (error) {
        throw errors.UnprocessableEntity('Unable to process request', {
            error
        });
    }
}

function toString(buffer: Buffer) {
    try {
        return buffer.toString();
    } catch (error) {
        return undefined;
    }
}

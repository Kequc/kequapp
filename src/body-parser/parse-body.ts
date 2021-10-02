import errors from '../util/errors';
import { sanitizeContentType } from '../util/sanitize';
import multipart from './multipart';

import { JsonData, RawBodyPart } from '../../types/body-parser';

function parseBody (body: RawBodyPart): JsonData {
    return {
        ...body,
        data: parseBuffer(body)
    };
}

export default parseBody;

function parseBuffer ({ data, contentType }: RawBodyPart): JsonData {
    switch (sanitizeContentType(contentType)) {
    case 'application/x-www-form-urlencoded':
        return data.map(parseUrlEncoded);
    case 'application/json':
        return data.map(parseJson);
    case 'multipart/form-data':
        return data.map(part => multipart(part).map(parseBuffer));
    default:
        return data;
    }
}

function parseUrlEncoded (buffer: Buffer): JsonData {
    const body = toString(buffer);

    if (body === undefined) {
        throw errors.UnprocessableEntity('Invalid request body');
    }

    try {
        const params = new URLSearchParams(body);
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
            error,
            body
        });
    }
}

function parseJson (buffer: Buffer): JsonData {
    const body = toString(buffer);

    if (body === undefined) {
        throw errors.UnprocessableEntity('Invalid request body');
    }

    try {
        return JSON.parse(body);
    } catch (error) {
        throw errors.UnprocessableEntity('Unable to process request', {
            error,
            body
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

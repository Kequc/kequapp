import errors from '../util/errors';

import { BodyPart } from '../../types/body-parser';

const PARSERS = {
    'text/': parseText,
    'application/x-www-form-urlencoded': parseUrlEncoded,
    'application/json': parseJson
};

function parseBody (body: BodyPart): BodyPart {
    try {
        return { ...body, data: getData(body) };
    } catch (error) {
        throw errors.UnprocessableEntity('Unable to process request', {
            contentType: body.headers['content-type'],
            error
        });
    }
}

export default parseBody;

function getData (body: BodyPart): any {
    const contentType = body.headers['content-type'] || 'text/plain';

    for (const key of Object.keys(PARSERS)) {
        if (contentType.startsWith(key)) {
            return PARSERS[key](body.data, contentType);
        }
    }

    return body.data;
}

function parseUrlEncoded (buffer: Buffer): any {
    const params = new URLSearchParams(parseText(buffer));
    const result: { [key: string]: any } = {};

    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            result[key] = params.getAll(key);
        } else {
            result[key] = params.get(key);
        }
    }

    return result;
}

function parseJson (buffer: Buffer): any {
    return JSON.parse(parseText(buffer));
}

function parseText (buffer: Buffer) {
    return buffer.toString();
}

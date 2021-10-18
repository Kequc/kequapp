import Ex from '../util/ex';

import { BodyPart, RawPart } from '../../types/body-parser';

const PARSERS = {
    'text/': parseText,
    'application/x-www-form-urlencoded': parseUrlEncoded,
    'application/json': parseJson
};

function parseBody (body: RawPart): BodyPart {
    const contentType = body.headers['content-type'] || 'text/plain';

    try {
        return { ...body, data: getData(body.data, contentType) };
    } catch (error) {
        throw Ex.UnprocessableEntity('Unable to process request', {
            contentType,
            error
        });
    }
}

export default parseBody;

function getData (data: Buffer, contentType: string): any {
    for (const key of Object.keys(PARSERS)) {
        if (contentType.startsWith(key)) {
            return PARSERS[key](data, contentType);
        }
    }
    return data;
}

function parseUrlEncoded (data: Buffer): any {
    const params = new URLSearchParams(parseText(data));
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

function parseJson (data: Buffer): any {
    return JSON.parse(parseText(data));
}

function parseText (data: Buffer) {
    return data.toString();
}

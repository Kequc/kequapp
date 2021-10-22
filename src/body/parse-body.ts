import Ex from '../util/ex';
import { BodyJson, RawPart } from './get-body';

export function parseUrlEncoded (body: RawPart): BodyJson {
    const params = new URLSearchParams(body.data.toString());
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

export function parseJson (body: RawPart): BodyJson {
    return JSON.parse(body.data.toString());
}

type Parser = (body: RawPart) => any;

function createParseBody (parsers: { [key: string]: Parser }, _default?: Parser): Parser {
    return function (body: RawPart) {
        const contentType = body.headers['content-type'] || 'text/plain';

        try {
            for (const key of Object.keys(parsers)) {
                if (contentType.startsWith(key)) {
                    return parsers[key](body);
                }
            }

            if (_default) return _default(body);

            throw new Error('Unrecognized content type');
        } catch (error) {
            throw Ex.BadRequest('Unable to process request', {
                contentType,
                error
            });
        }
    };
}

export default createParseBody;

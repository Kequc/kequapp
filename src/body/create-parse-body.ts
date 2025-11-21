import Ex from '../built-in/tools/ex.ts';
import type { BodyJson, RawPart } from '../types.ts';

type Parser = (body: RawPart) => any;

export default function createParseBody(
    parsers: { [k: string]: Parser },
    _default?: Parser,
): Parser {
    return (body: RawPart) => {
        const contentType = body.headers['content-type'] ?? 'text/plain';

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
                error,
            });
        }
    };
}

export function parseUrlEncoded(body: RawPart): BodyJson {
    const params = new URLSearchParams(body.data.toString());
    const result: BodyJson = {};

    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            result[key] = params.getAll(key);
        } else {
            result[key] = params.get(key);
        }
    }

    return result;
}

export function parseJson(body: RawPart): BodyJson {
    return JSON.parse(body.data.toString());
}

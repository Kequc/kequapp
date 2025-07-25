import Ex from '../built-in/tools/ex.ts';
import type { TBodyJson, TRawPart } from '../types.ts';

// biome-ignore lint/suspicious/noExplicitAny: it really can be anything
type TParser = (body: TRawPart) => any;

export default function createParseBody(
    parsers: { [k: string]: TParser },
    _default?: TParser,
): TParser {
    return (body: TRawPart) => {
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

export function parseUrlEncoded(body: TRawPart): TBodyJson {
    const params = new URLSearchParams(body.data.toString());
    const result: TBodyJson = {};

    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            result[key] = params.getAll(key);
        } else {
            result[key] = params.get(key);
        }
    }

    return result;
}

export function parseJson(body: TRawPart): TBodyJson {
    return JSON.parse(body.data.toString());
}

import type { ServerResponse } from 'node:http';
import type { Readable } from 'node:stream';
import type { GetResponse, GetResponseOptions, RawPart } from '../types.ts';
import type { FakeRes } from '../util/fake-http.ts';
import { createParseBody, parseJson } from './create-parse-body.ts';
import { streamReader } from './stream-reader.ts';

const parseBody = createParseBody(
    {
        'text/': ({ data }) => data.toString(),
        'application/json': parseJson,
    },
    ({ data }) => data,
);

export function createGetResponse(res: ServerResponse | FakeRes): GetResponse {
    let _body: RawPart;

    return async (options: GetResponseOptions = {}) => {
        if (_body === undefined) {
            // ensures application has responded
            const data = await streamReader(res as Readable);

            _body = {
                headers: {
                    'content-type': String(res.getHeader('Content-Type') ?? ''),
                    'content-disposition': String(res.getHeader('Content-Disposition') ?? ''),
                },
                data,
            };
        }

        if (options.raw === true) {
            return _body.data;
        }

        return parseBody(_body);
    };
}

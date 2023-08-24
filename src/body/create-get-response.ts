import { ServerResponse } from 'http';
import { Readable } from 'stream';
import createParseBody, { parseJson } from './create-parse-body';
import streamReader from './stream-reader';
import { IGetResponse, TGetResponseOptions, TRawPart } from '../types';

const parseBody = createParseBody({
    'text/': ({ data }) => data.toString(),
    'application/json': parseJson
}, ({ data }) => data);

export default function createGetResponse (res: ServerResponse): IGetResponse {
    let _body: TRawPart;

    return async function (options: TGetResponseOptions = {}) {
        if (_body === undefined) {
            // ensures application has responded
            const data = await streamReader(res as unknown as Readable);

            _body = {
                headers: {
                    'content-type': String(res.getHeader('Content-Type') ?? ''),
                    'content-disposition': String(res.getHeader('Content-Disposition') ?? '')
                },
                data
            };
        }

        if (options.raw === true) {
            return _body.data;
        }

        return parseBody(_body);
    };
}

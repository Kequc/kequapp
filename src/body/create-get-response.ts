import { ServerResponse } from 'http';
import { Readable } from 'stream';
import { getHeader } from '../utils/sanitize';
import { RawPart } from './create-get-body';
import createParseBody, { parseJson } from './create-parse-body';
import streamReader from './stream-reader';


export interface IGetResponse {
    (format: ResponseOptions & { raw: true }): Promise<Buffer>;
    (format?: ResponseOptions): Promise<any>;
}
export type ResponseOptions = {
    raw?: boolean;
};


const parseBody = createParseBody({
    'text/': ({ data }) => data.toString(),
    'application/json': parseJson,
}, ({ data }) => data);

function createGetResponse (res: ServerResponse): IGetResponse {
    let _body: RawPart;

    return async function (options: ResponseOptions = {}) {
        if (_body === undefined) {
            const data = await streamReader(res as unknown as Readable);
            const headers = {
                'content-type': getHeader(res, 'Content-Type'),
                'content-disposition': getHeader(res, 'Content-Disposition'),
            };
            _body = { headers, data };
        }

        if (options.raw === true) {
            return _body.data;
        }

        return parseBody(_body);
    };
}

export default createGetResponse;

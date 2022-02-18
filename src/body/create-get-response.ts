import { Readable } from 'stream';
import createParseBody, { parseJson } from './create-parse-body';
import streamReader from './stream-reader';
import { getHeaders } from '../util/sanitize';

const parseBody = createParseBody({
    'text/': ({ data }) => data.toString(),
    'application/json': parseJson,
}, ({ data }) => data);

function createGetResponse (res: TRes): IGetResponse {
    let _body: TRawPart;

    return async function (options: TResponseOptions = {}) {
        if (_body === undefined) {
            const data = await streamReader(res as unknown as Readable);
            const headers = getHeaders(res, ['Content-Type', 'Content-Disposition']);
            _body = { headers, data };
        }

        if (options.raw === true) {
            return _body.data;
        }

        return parseBody(_body);
    };
}

export default createGetResponse;

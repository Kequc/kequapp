import { ServerResponse } from 'http';
import { RawPart } from './create-get-body';
import createParseBody, { parseJson } from './parse-body';
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
            _body = await streamReader(res);
        }

        if (options.raw === true) {
            return _body.data;
        }

        return parseBody(_body);
    };
}

export default createGetResponse;

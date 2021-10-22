import { ServerResponse } from 'http';
import createParseBody, { parseJson } from './parse-body';
import streamReader from './stream-reader';

import { RawPart } from '../../types/body-parser';

export interface IGetResponse {
    (format?: ResponseFormat.DEFAULT): Promise<any>;
    (format: ResponseFormat.RAW): Promise<RawPart>;
}

export enum ResponseFormat {
    DEFAULT,
    RAW
}

const parseBody = createParseBody({
    'text/': ({ data }) => data.toString(),
    'application/json': parseJson,
}, ({ data }) => data);

function createGetResponse (res: ServerResponse): IGetResponse {
    let _body: RawPart;

    return async function (format?: ResponseFormat) {
        if (_body === undefined) {
            _body = await streamReader(res);
        }

        if (format === ResponseFormat.RAW) {
            return clone(_body);
        }

        return parseBody(_body);
    };
}

export default createGetResponse;

function clone (body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

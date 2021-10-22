import { ServerResponse } from 'http';
import createParseBody, { parseJson } from './parse-body';
import streamReader from './stream-reader';
import { BodyFormat } from '../main';

import { RawPart } from '../../types/body-parser';

export interface IGetResponse {
    (format?: BodyFormat.DEFAULT): Promise<any>;
    (format: BodyFormat.RAW): Promise<RawPart>;
}

const parseBody = createParseBody({
    'text/': ({ data }) => data.toString(),
    'application/json': parseJson,
}, ({ data }) => data);

function createGetResponse (res: ServerResponse): IGetResponse {
    let _body: RawPart;

    return async function (format?: BodyFormat) {
        if (_body === undefined) {
            _body = await streamReader(res);
        }

        if (format === BodyFormat.RAW) {
            return clone(_body);
        }

        return parseBody(_body);
    };
}

export default createGetResponse;

function clone (body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

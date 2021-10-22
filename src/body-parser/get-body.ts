import { IncomingMessage } from 'http';
import createParseBody, { parseUrlEncoded, parseJson } from './parse-body';
import parseMultipart from './parse-multipart';
import splitMultipart from './split-multipart';
import streamReader from './stream-reader';

import { BodyJson, BodyPart, RawPart } from '../../types/body-parser';

export interface IGetBody {
    (format?: BodyFormat.DEFAULT): Promise<BodyJson>;
    (format: BodyFormat.RAW): Promise<RawPart>;
    (format: BodyFormat.MULTIPART): Promise<[BodyJson, BodyPart[]]>;
    (format: BodyFormat.RAW_MULTIPART): Promise<RawPart[]>;
}

export enum BodyFormat {
    DEFAULT,
    RAW,
    MULTIPART,
    RAW_MULTIPART
}

const parseBody = createParseBody({
    'application/x-www-form-urlencoded': parseUrlEncoded,
    'application/json': parseJson,
});

function createGetBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: RawPart;

    return async function (format?: BodyFormat) {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        if (format === BodyFormat.RAW) {
            return clone(_body);
        }

        const isMultipart = _body.headers['content-type']?.startsWith('multipart/');
        if (isMultipart) {
            const parts = splitMultipart(_body);
            switch (format) {
            case BodyFormat.MULTIPART:
                return parseMultipart(parts);
            case BodyFormat.RAW_MULTIPART:
                return parts;
            default:
                return parseMultipart(parts)[0];
            }
        }

        switch (format) {
        case BodyFormat.MULTIPART:
            return [parseBody(_body), []];
        case BodyFormat.RAW_MULTIPART:
            return [clone(_body)];
        default:
            return parseBody(_body);
        }
    };
}

export default createGetBody;

function clone (body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

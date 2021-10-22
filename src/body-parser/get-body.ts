import { IncomingMessage } from 'http';
import createParseBody, { parseUrlEncoded, parseJson } from './parse-body';
import parseMultipart from './parse-multipart';
import splitMultipart from './split-multipart';
import streamReader from './stream-reader';
import verifyBody, { BodyOptions } from './verify-body';

import { BodyJson, BodyPart, RawPart } from '../../types/body-parser';

export interface IGetBody {
    (format: BodyFormat.RAW): Promise<RawPart>;
    (format: BodyFormat.MULTIPART): Promise<[BodyJson, BodyPart[]]>;
    (format: BodyFormat.RAW_MULTIPART): Promise<RawPart[]>;
    (format: BodyOptions & { multipart: true }): Promise<[BodyJson, BodyPart[]]>;
    (format: BodyOptions): Promise<BodyJson>;
    (format?: BodyFormat.DEFAULT): Promise<BodyJson>;
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

    return async function (format?: BodyFormat | BodyOptions): Promise<any> {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        if (format === BodyFormat.RAW) {
            return clone(_body);
        }

        const isMultipartRequest = _body.headers['content-type']?.startsWith('multipart/');

        if (format === BodyFormat.RAW_MULTIPART) {
            return isMultipartRequest ? splitMultipart(_body) : [clone(_body)];
        }

        if (isMultipartRequest) {
            const [result, files] = parseMultipart(splitMultipart(_body));
            const body = verifyBody(result, format);
            return returnMultipart(format) ? [body, files] : body;
        } else {
            const result = parseBody(_body);
            const body = verifyBody(result, format);
            return returnMultipart(format) ? [body, []] : body;
        }
    };
}

export default createGetBody;

function clone (body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

function returnMultipart (format?: BodyFormat | BodyOptions): boolean {
    if (typeof format === 'number') {
        return format === BodyFormat.MULTIPART;
    }
    if (format && format.multipart === true) return true;
    return false;
}

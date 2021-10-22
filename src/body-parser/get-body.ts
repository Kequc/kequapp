import { IncomingMessage } from 'http';
import createParseBody, { parseUrlEncoded, parseJson } from './parse-body';
import parseMultipart from './parse-multipart';
import splitMultipart from './split-multipart';
import streamReader from './stream-reader';
import normalizeBody from './normalize-body';

import { BodyJson } from '../../types/main';


export interface IGetBody {
    (format: BodyOptions & { raw: true, multipart: true }): Promise<RawPart[]>;
    (format: BodyOptions & { raw: true }): Promise<Buffer>;
    (format: BodyOptions & { multipart: true }): Promise<[BodyJson, BodyPart[]]>;
    (format?: BodyOptions): Promise<BodyJson>;
}

export type BodyOptions = {
    raw?: boolean;
    multipart?: boolean;
    array?: string[];
    required?: string[];
    validate?: (body: BodyJson) => string | void;
    postProcess?: (body: BodyJson) => BodyJson;
};

export type StaticFilesOptions = {
    dir?: string;
    exclude?: string[];
};

export type RawPart = {
    headers: { [key: string]: string };
    data: Buffer;
};

export type BodyPart = RawPart & {
    mime?: string;
    name?: string;
    filename?: string;
};


const parseBody = createParseBody({
    'application/x-www-form-urlencoded': parseUrlEncoded,
    'application/json': parseJson,
});

function createGetBody (req: IncomingMessage, maxPayloadSize?: number): IGetBody {
    let _body: RawPart;

    return async function (options: BodyOptions = {}): Promise<any> {
        if (_body === undefined) {
            _body = await streamReader(req, maxPayloadSize);
        }

        const isMultipartRequest = _body.headers['content-type']?.startsWith('multipart/');

        if (options.raw === true && options.multipart === true) {
            return isMultipartRequest ? splitMultipart(_body) : [clone(_body)];
        } else if (options.raw === true) {
            return _body.data;
        }

        if (isMultipartRequest) {
            const [result, files] = parseMultipart(splitMultipart(_body));
            const body = normalizeBody(result, options);
            return options.multipart === true ? [body, files] : body;
        }

        const result = parseBody(_body);
        const body = normalizeBody(result, options);
        return options.multipart === true ? [body, []] : body;
    };
}

export default createGetBody;

function clone (body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

import { IncomingMessage } from 'http';
import parseMultipart from './multipart/parse-multipart';
import splitMultipart from './multipart/split-multipart';
import createParseBody, { parseUrlEncoded, parseJson, BodyJson } from './parse-body';
import streamReader from './stream-reader';
import normalizeBody from './normalize-body';


export interface IGetBody {
    (format: BodyOptions & { raw: true, multipart: true }): Promise<RawPart[]>;
    (format: BodyOptions & { raw: true }): Promise<Buffer>;
    (format: BodyOptions & { multipart: true }): Promise<[BodyJson, FilePart[]]>;
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

export type FilePart = RawPart & {
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

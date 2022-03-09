import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import zlib from 'zlib';
import createParseBody, { parseJson, parseUrlEncoded } from './create-parse-body';
import parseMultipart from './multipart/parse-multipart';
import splitMultipart from './multipart/split-multipart';
import normalizeBody from './normalize-body';
import streamReader from './stream-reader';
import { IGetBody, TBodyOptions, TRawPart } from '../types';
import Ex from '../util/ex';
import { getHeaders } from '../util/sanitize';

const parseBody = createParseBody({
    'application/x-www-form-urlencoded': parseUrlEncoded,
    'application/json': parseJson,
});

export default function createGetBody (req: IncomingMessage): IGetBody {
    let _body: TRawPart;

    return async function (options: TBodyOptions = {}): Promise<any> {
        if (_body === undefined) {
            const data = await streamReader(getStream(req), getMaxPayloadSize(options));
            const headers = getHeaders(req, ['Content-Type', 'Content-Disposition']);
            _body = { headers, data };
        }

        const isMultipartRequest = _body.headers['content-type']?.startsWith('multipart/');

        if (options.raw === true) {
            if (options.multipart === true) {
                return isMultipartRequest ? splitMultipart(_body) : [clone(_body)];
            }
            return _body.data;
        }

        if (isMultipartRequest) {
            const [result, files] = parseMultipart(splitMultipart(_body));
            const body = normalizeBody(result, options);

            if (options.multipart === true) return [body, files];
            return body;
        } else {
            const result = parseBody(_body);
            const body = normalizeBody(result, options);

            if (options.multipart === true) return [body, []];
            return body;
        }
    };
}

function getStream (req: IncomingMessage): Readable {
    const encoding = (req.headers['content-encoding'] || 'identity').toLowerCase();

    switch (encoding) {
    case 'br': return req.pipe(zlib.createBrotliDecompress());
    case 'gzip': return req.pipe(zlib.createGunzip());
    case 'deflate': return req.pipe(zlib.createInflate());
    case 'identity': return req;
    }

    throw Ex.UnsupportedMediaType(`Unsupported encoding: ${encoding}`, {
        encoding
    });
}

function getMaxPayloadSize (options: TBodyOptions): number {
    if (typeof options.maxPayloadSize === 'number' && options.maxPayloadSize > 0) {
        return options.maxPayloadSize;
    }
    return 1e6;
}

function clone (body: TRawPart): TRawPart {
    return { ...body, headers: { ...body.headers } };
}

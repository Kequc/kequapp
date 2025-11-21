import type { IncomingMessage } from "node:http";
import type { Readable } from "node:stream";
import zlib from "node:zlib";
import Ex from "../built-in/tools/ex.ts";
import type { GetBody, GetBodyOptions, RawPart } from "../types.ts";
import type { FakeReq } from "../util/fake-http.ts";
import createParseBody, {
    parseJson,
    parseUrlEncoded,
} from "./create-parse-body.ts";
import parseMultipart from "./multipart/parse-multipart.ts";
import splitMultipart from "./multipart/split-multipart.ts";
import normalizeBody from "./normalize-body.ts";
import streamReader from "./stream-reader.ts";

const parseBody = createParseBody({
    "application/x-www-form-urlencoded": parseUrlEncoded,
    "application/json": parseJson,
});

export default function createGetBody(req: IncomingMessage | FakeReq): GetBody {
    let _body: RawPart;

    return async (options: GetBodyOptions = {}): Promise<any> => {
        if (_body === undefined) {
            _body = {
                headers: {
                    "content-type": req.headers["content-type"] ?? "",
                    "content-disposition":
                        req.headers["content-disposition"] ?? "",
                },
                data: await streamReader(
                    getStream(req),
                    getMaxPayloadSize(options),
                ),
            };
        }

        const isMultipartRequest =
            _body.headers["content-type"].startsWith("multipart/");

        if (options.raw === true) {
            if (options.multipart === true) {
                return isMultipartRequest
                    ? splitMultipart(_body)
                    : [clone(_body)];
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

function getStream(req: IncomingMessage | FakeReq): Readable {
    const encoding = (
        req.headers["content-encoding"] ?? "identity"
    ).toLowerCase();

    switch (encoding) {
        case "br":
            return req.pipe(zlib.createBrotliDecompress());
        case "gzip":
            return req.pipe(zlib.createGunzip());
        case "deflate":
            return req.pipe(zlib.createInflate());
        case "identity":
            return req;
    }

    throw Ex.UnsupportedMediaType(`Unsupported encoding: ${encoding}`, {
        encoding,
    });
}

function getMaxPayloadSize(options: GetBodyOptions): number {
    if (
        typeof options.maxPayloadSize === "number" &&
        options.maxPayloadSize > 0
    ) {
        return options.maxPayloadSize;
    }
    return 1e6;
}

function clone(body: RawPart): RawPart {
    return { ...body, headers: { ...body.headers } };
}

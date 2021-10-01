import { IncomingMessage, ServerResponse } from 'http';
import Header from './header';
import errors from './errors';
import parseMultipart from './parse-multipart';

async function streamReader (stream: IncomingMessage | ServerResponse, maxPayloadSize: number| null) {
    return await new Promise<(DataObject | FileData | Buffer)[]>(function (resolve, reject) {
        const chunks: Buffer[] = [];

        stream.on('data', handleData);
        stream.on('end', handleEnd);

        function handleData (chunk: Buffer) {
            chunks.push(chunk);
            verifyPayload();
        }

        function handleEnd () {
            const contentType = new Header(getContentType(stream));
            const values = contentType.values();
            const buffer = Buffer.concat(chunks);

            switch (contentType.sanitize()) {
            case 'application/x-www-form-urlencoded':
                resolve([parseUrlEncoded(buffer)]);
                break;
            case 'application/json':
                resolve([parseJson(buffer)]);
                break;
            case 'multipart/form-data':
                resolve(parseMultipart(buffer, values.boundary));
                break;
            default:
                resolve([buffer]);
            }
        }

        function abortStream (error: Error) {
            stream.off('data', handleData);
            stream.off('end', handleEnd);

            reject(error);
        }

        function verifyPayload () {
            if (maxPayloadSize !== null) {
                const payloadSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

                if (payloadSize > maxPayloadSize) {
                    abortStream(errors.PayloadTooLarge());
                }
            }
        }
    });
}

export default streamReader;

function getContentType (stream: IncomingMessage | ServerResponse): string | undefined {
    if ('getHeader' in stream) {
        return stream.getHeader('Content-Type') as string || undefined;
    } else if ('headers' in stream) {
        return stream.headers['content-type'] as string || undefined;
    }
}

function parseUrlEncoded (buffer: Buffer) {
    const params = new URLSearchParams(buffer.toString());
    const result = {};

    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            result[key] = params.getAll(key);
        } else {
            result[key] = params.get(key);
        }
    }

    return result;
}

function parseJson (buffer: Buffer) {
    return JSON.parse(buffer.toString());
}

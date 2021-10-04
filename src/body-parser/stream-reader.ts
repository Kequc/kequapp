import { IncomingMessage, ServerResponse } from 'http';
import errors from '../util/errors';

import { RawBodyPart } from '../../types/body-parser';

async function streamReader (stream: IncomingMessage | ServerResponse, maxPayloadSize?: number) {
    return await new Promise<RawBodyPart>(function (resolve, reject) {
        const chunks: Buffer[] = [];

        stream.on('data', handleData);
        stream.on('end', handleEnd);

        function handleData (chunk: Buffer) {
            chunks.push(chunk);
            verifyPayload();
        }

        function handleEnd () {
            const contentType = getHeader(stream, 'Content-Type').trim();
            const contentDisposition = getHeader(stream, 'Content-Disposition').trim();
            const data = Buffer.concat(chunks);
            resolve({ contentType, contentDisposition, data });
        }

        function abortStream (error: Error) {
            stream.off('data', handleData);
            stream.off('end', handleEnd);

            reject(error);
        }

        function verifyPayload () {
            if (maxPayloadSize) {
                const payloadSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

                if (payloadSize > maxPayloadSize) {
                    abortStream(errors.PayloadTooLarge());
                }
            }
        }
    });
}

export default streamReader;

function getHeader (stream: IncomingMessage | ServerResponse, name: string): string {
    if ('getHeader' in stream) {
        return stream.getHeader(name) as string || '';
    } else if ('headers' in stream) {
        return stream.headers[name.toLowerCase()] as string || '';
    }
    return '';
}

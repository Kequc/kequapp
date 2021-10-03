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
            const contentType = getContentType(stream).trim();
            const data = Buffer.concat(chunks);
            resolve({ contentType, data });
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

function getContentType (stream: IncomingMessage | ServerResponse): string {
    if ('getHeader' in stream) {
        return stream.getHeader('Content-Type') as string || '';
    } else if ('headers' in stream) {
        return stream.headers['content-type'] as string || '';
    }
    return '';
}

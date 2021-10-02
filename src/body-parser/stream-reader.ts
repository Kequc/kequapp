import { IncomingMessage, ServerResponse } from 'http';
import errors from '../util/errors';

import { RawBodyPart } from '../../types/body-parser';

async function streamReader (stream: IncomingMessage | ServerResponse, maxPayloadSize: number| null) {
    return await new Promise<RawBodyPart>(function (resolve, reject) {
        const chunks: Buffer[] = [];

        stream.on('data', handleData);
        stream.on('end', handleEnd);

        function handleData (chunk: Buffer) {
            chunks.push(chunk);
            verifyPayload();
        }

        function handleEnd () {
            const contentType = getContentType(stream);
            resolve({
                contentType,
                data: Buffer.concat(chunks)
            });
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

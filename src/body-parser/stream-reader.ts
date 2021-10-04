import { IncomingMessage, ServerResponse } from 'http';
import errors from '../util/errors';

import { BodyPart } from '../../types/body-parser';

async function streamReader (stream: IncomingMessage | ServerResponse, maxPayloadSize?: number) {
    return await new Promise<BodyPart>(function (resolve, reject) {
        const chunks: Buffer[] = [];

        stream.on('data', handleData);
        stream.on('end', handleEnd);

        function handleData (chunk: Buffer) {
            chunks.push(chunk);
            verifyPayload();
        }

        function handleEnd () {
            resolve({
                headers: {
                    'content-type': getHeader(stream, 'Content-Type'),
                    'content-disposition': getHeader(stream, 'Content-Disposition'),
                },
                data: Buffer.concat(chunks)
            });
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
        return String(stream.getHeader(name) || '').trim();
    } else if ('headers' in stream) {
        return String(stream.headers[name.toLowerCase()] || '').trim();
    }
    return '';
}

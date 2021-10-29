import { IncomingMessage, ServerResponse } from 'http';
import { RawPart } from './create-get-body';
import Ex from '../utils/ex';
import { getHeader } from '../utils/sanitize';

function streamReader (stream: IncomingMessage | ServerResponse, maxPayloadSize?: number): Promise<RawPart> {
    return new Promise<RawPart>(function (resolve, reject) {
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
                    abortStream(Ex.PayloadTooLarge());
                }
            }
        }
    });
}

export default streamReader;

import { Readable } from 'stream';
import Ex from '../util/tools/ex';

export default function streamReader (stream: Readable, maxPayloadSize = Infinity): Promise<Buffer> {
    return new Promise(function (resolve, reject) {
        const chunks: Buffer[] = [];

        stream.on('data', handleData);
        stream.on('end', handleEnd);

        function handleData (chunk: Buffer) {
            chunks.push(chunk);
            verifyPayload();
        }

        function handleEnd () {
            resolve(Buffer.concat(chunks));
        }

        function abortStream (error: Error) {
            stream.off('data', handleData);
            stream.off('end', handleEnd);

            reject(error);
        }

        function verifyPayload () {
            if (maxPayloadSize !== Infinity) {
                const payloadSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

                if (payloadSize > maxPayloadSize) {
                    abortStream(Ex.PayloadTooLarge());
                }
            }
        }
    });
}

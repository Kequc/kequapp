import { Transform } from 'stream';
import { TInjectOptions, TParams } from '../../types';

class FakeIncomingMessage extends Transform {
    method: string;
    url: string;
    headers: TParams;
    rawHeaders: string[];

    constructor (options: Partial<TInjectOptions>) {
        super();

        this.method = options.method || 'GET';
        this.url = options.url || '';
        this.headers = {};
        this.rawHeaders = [];

        if (options.headers) {
            for (const key of Object.keys(options.headers)) {
                if (options.headers[key] === undefined) continue;
                const value = String(options.headers[key]);
                this.headers[key.toLowerCase()] = value;
                this.rawHeaders.push(key, value);
            }
        }

        if (options.body !== null) {
            this.end(options.body);
        }
    }

    _transform (chunk: string | Buffer, enc: string, done: () => void): void {
        if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
            this.push(JSON.stringify(chunk));
        } else {
            this.push(chunk);
        }

        done();
    }
}

export default FakeIncomingMessage as any;

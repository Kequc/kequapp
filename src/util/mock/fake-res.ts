import { OutgoingHttpHeaders, STATUS_CODES } from 'http';
import { Transform } from 'stream';
import { THeader } from '../../types';

class FakeServerResponse extends Transform {
    statusCode: number;
    statusMessage: string;

    private _headers: OutgoingHttpHeaders;
    private _responseData: Buffer[];

    constructor () {
        super();

        this.statusCode = 200;
        this.statusMessage = STATUS_CODES[this.statusCode]!;

        this._headers = {};
        this._responseData = [];
    }

    _transform (chunk: Buffer, enc: string, done: () => void): void {
        this.push(chunk);
        this._responseData.push(chunk);
        done();
    }

    setHeader (name: string, value: THeader): void {
        this._headers[name.toLowerCase()] = value;
    }

    getHeader (name: string): THeader {
        return this._headers[name.toLowerCase()];
    }

    getHeaders (): OutgoingHttpHeaders {
        return this._headers;
    }

    removeHeader (name: string): void {
        delete this._headers[name.toLowerCase()];
    }

    writeHead (statusCode: number, statusMessage?: string | undefined, headers?: OutgoingHttpHeaders): void {
        if (arguments.length == 2 && typeof statusMessage !== 'string') {
            headers = statusMessage;
            statusMessage = undefined;
        }

        this.statusCode = statusCode;
        this.statusMessage = statusMessage as string || STATUS_CODES[statusCode] || 'unknown';

        if (!headers) return;

        for (const name of Object.keys(headers)) {
            this.setHeader(name, headers[name]);
        }
    }

    _getString (): string {
        return Buffer.concat(this._responseData).toString();
    }

    _getJSON (): any {
        return JSON.parse(this._getString());
    }
}

export default FakeServerResponse as any;

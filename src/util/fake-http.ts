import { OutgoingHttpHeaders, STATUS_CODES } from 'http';
import { Transform } from 'stream';
import { THeader, TParams, TReqOptions } from '../types';

export class FakeReq extends Transform {
    [key: string]: any;
    method: string;
    url: string;
    headers: TParams;
    rawHeaders: string[];

    constructor (options: Partial<TReqOptions>) {
        super();

        for (const key of Object.keys(options)) {
            this[key] = options[key];
        }

        this.method = options.method || 'GET';
        this.url = options.url || '';
        this.headers = {};
        this.rawHeaders = [];

        if (options.headers) {
            for (const key of Object.keys(options.headers)) {
                if (options.headers[key] === undefined) continue;
                const value = options.headers[key];
                this.headers[key.toLowerCase()] = value;
                this.rawHeaders.push(key, value);
            }
        }

        if (options.body !== null) {
            this.end(options.body);
        }
    }

    _transform (chunk: string | Buffer, enc: string, done: () => void): void {
        if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
            this.push(chunk);
        } else {
            this.push(JSON.stringify(chunk));
        }
        done();
    }
}

export class FakeRes extends Transform {
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

    writeHead (statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders): void {
        if (statusMessage !== undefined && typeof statusMessage !== 'string') {
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

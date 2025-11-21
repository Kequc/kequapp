/**
 * Unit test fakes for IncomingMessage / ServerResponse usage.
 *
 * These are intentionally minimal helpers for unit tests — they do not fully
 * implement node:http internals. They provide:
 *  - header helpers
 *  - buffering of written response bytes via `_getBuffer()`/`_getString()`
 *  - a small set of flags (`headersSent`, `finished`, `writableEnded`, ...)
 *
 * Known deviations:
 *  - `FakeReq` accepts `body` as a string or Buffer only. If `body` is
 *    omitted or undefined it will be consumed and the stream closed.
 *  - Setting `body: null` keeps the request stream open as opposed to having
 *    to explicitly close it.
 *  - These fakes intentionally avoid re-implementing the full Node stream
 *    state machine or exact semantics.
 */

import { type OutgoingHttpHeaders, STATUS_CODES } from 'node:http';
import { Transform } from 'node:stream';
import type { Header, Params, ReqOptions } from '../types.ts';

export class FakeReq extends Transform {
    [key: string]: unknown;
    method: string;
    url: string;
    headers: Params;
    rawHeaders: string[];
    aborted: boolean;
    complete: boolean;
    socket: unknown;
    connection: unknown;
    trailers: Record<string, string>;
    rawTrailers: string[];
    headersDistinct?: unknown;
    trailersDistinct?: unknown;

    constructor(options: ReqOptions) {
        super();
        this.aborted = false;
        this.complete = false;
        this.socket = undefined;
        this.connection = undefined;
        this.trailers = {};
        this.rawTrailers = [];
        this.headersDistinct = undefined;
        this.trailersDistinct = undefined;

        for (const key of Object.keys(options)) {
            this[key] = options[key];
        }

        this.method = options.method ?? 'GET';
        this.url = options.url ?? '';
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

        // Special case: only auto-close the request stream when body was
        // not explicitly set to null. Tests sometimes pass `body: null` to
        // keep the stream open for manual writes.
        if (options.body !== null) {
            this.end(options.body);
        }

        this.on('end', () => {
            this.complete = true;
        });
    }

    setTimeout(ms: number, cb?: () => void): this {
        if (typeof cb === 'function') setTimeout(cb, ms);
        return this;
    }

    pause(): this {
        try {
            Transform.prototype.pause?.call(this);
        } catch (_) {}
        return this;
    }

    resume(): this {
        try {
            Transform.prototype.resume?.call(this);
        } catch (_) {}
        return this;
    }

    destroy(err?: Error): this {
        if (err) this.emit('error', err);
        try {
            Transform.prototype.destroy?.call(this, err);
        } catch (_) {}
        return this;
    }

    _transform(chunk: string | Buffer, _enc: string, done: () => void): void {
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
    headersSent: boolean;
    finished: boolean;
    writableEnded: boolean;
    writableFinished: boolean;

    private _headers: OutgoingHttpHeaders;
    private _responseData: Buffer[];

    constructor() {
        super();

        this.statusCode = 200;
        this.statusMessage = STATUS_CODES[this.statusCode] ?? 'OK';

        this._headers = {};
        this._responseData = [];
        this.headersSent = false;
        this.finished = false;
        this.writableEnded = false;
        this.writableFinished = false;

        this.on('finish', () => {
            this.finished = true;
            this.writableFinished = true;
            this.writableEnded = true;
        });
    }

    _transform(chunk: Buffer, _enc: string, done: () => void): void {
        this.push(chunk);
        this._responseData.push(chunk);
        if (!this.headersSent) this.headersSent = true;
        done();
    }

    setHeader(name: string, value: Header): void {
        this._headers[name.toLowerCase()] = value;
    }

    getHeader(name: string): Header {
        return this._headers[name.toLowerCase()];
    }

    getHeaders(): OutgoingHttpHeaders {
        return this._headers;
    }

    getHeaderNames(): string[] {
        return Object.keys(this._headers);
    }

    hasHeader(name: string): boolean {
        return Object.prototype.hasOwnProperty.call(this._headers, name.toLowerCase());
    }

    removeHeader(name: string): void {
        delete this._headers[name.toLowerCase()];
    }

    addTrailers(headers: OutgoingHttpHeaders): void {
        for (const k of Object.keys(headers)) {
            this._headers[k.toLowerCase()] = headers[k];
        }
    }

    flushHeaders(): void {
        this.headersSent = true;
    }

    writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders): void {
        if (statusMessage !== undefined && typeof statusMessage !== 'string') {
            headers = statusMessage as unknown as OutgoingHttpHeaders;
            statusMessage = undefined;
        }

        this.statusCode = statusCode;
        this.statusMessage = statusMessage ?? STATUS_CODES[statusCode] ?? 'unknown';

        if (headers) {
            for (const name of Object.keys(headers)) {
                this.setHeader(name, headers[name]);
            }
        }

        this.headersSent = true;
    }

    writeContinue(): void {}
    writeProcessing(): void {}
    assignSocket(_socket: unknown): void {}
    detachSocket(): void {}

    _getBuffer(): Buffer {
        return Buffer.concat(this._responseData);
    }

    _getString(): string {
        return this._getBuffer().toString();
    }

    _getJSON(): unknown {
        return JSON.parse(this._getString());
    }

    end(...args: any[]): this {
        this.finished = true;
        this.headersSent = true;
        try {
            this.writableEnded = true;
            this.writableFinished = true;
        } catch (_) {}

        super.end(...args);
        return this;
    }

    setTimeout(ms: number, cb?: () => void): this {
        if (typeof cb === 'function') setTimeout(cb, ms);
        return this;
    }
}

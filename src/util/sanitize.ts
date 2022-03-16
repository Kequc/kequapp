import { IncomingMessage, ServerResponse } from 'http';
import { THeaders, TParams } from '../types';

export function sanitizePathname (pathname = ''): string {
    const result = pathname.replace(/[\\/]+$/, '');

    if (result[0] !== '/') {
        return `/${result}`;
    }

    return result;
}

export function sanitizeContentType (contentType = ''): string {
    return contentType.split(';')[0].toLowerCase().trim() || 'text/plain';
}

export function getHeaders (stream: IncomingMessage | ServerResponse, names: string[]): TParams {
    const result: TParams = {};

    for (const name of names) {
        result[name.toLowerCase()] = getHeader(stream, name);
    }

    return result;
}

export function getHeader (stream: IncomingMessage | ServerResponse, name: string): string {
    if ('getHeader' in stream) {
        return String(stream.getHeader(name) || '').trim();
    } else if ('headers' in stream) {
        return String(stream.headers[name.toLowerCase()] || '').trim();
    }

    return '';
}

export function extendHeader (res: ServerResponse, key: string, value: string): void {
    const existing = res.getHeader(key);

    if (existing === undefined) {
        res.setHeader(key, value);
    } else if (Array.isArray(existing)) {
        res.setHeader(key, [...existing, value]);
    } else {
        res.setHeader(key, `${existing},${value}`);
    }
}

export function setHeaders (res: ServerResponse, headers: THeaders): void {
    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) {
            res.removeHeader(key);
        } else {
            res.setHeader(key, value);
        }
    }
}

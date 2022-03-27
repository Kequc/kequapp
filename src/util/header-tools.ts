import { ServerResponse } from 'http';
import { THeader, THeaders } from '../types';

const NO_DUPE = [
    'age',
    'authorization',
    'content-length',
    'content-type',
    'etag',
    'expires',
    'from',
    'host',
    'if-modified-since',
    'if-unmodified-since',
    'last-modified',
    'location',
    'max-forwards',
    'proxy-authorization',
    'referer',
    'retry-after',
    'server',
    'user-agent'
];

export function getHeaderString (res: ServerResponse, key?: string): string {
    if (key === undefined) return '';

    const values = getValues(res.getHeader(key));
    const _key = key.toLowerCase();

    if (NO_DUPE.includes(_key)) {
        return values[0] || '';
    } else {
        return stringify(values, _key === 'cookie');
    }
}

export function extendHeader (res: ServerResponse, key?: string, value?: THeader): void {
    if (key === undefined || value === undefined) return;

    const values = [
        ...getValues(res.getHeader(key)),
        ...getValues(value)
    ];

    res.setHeader(key, [...new Set(values)]);
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

function getValues (value: THeader): string[] {
    if (value === undefined) {
        return [];
    }

    return (Array.isArray(value) ? value : [value])
        .map(item => String(item).split(','))
        .flat()
        .map(item => item.trim());
}

function stringify (values: string[], isCookie = false) {
    return [...new Set(values)].join(isCookie ? ';' : ',');
}

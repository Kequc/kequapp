import { ServerResponse } from 'http';
import { validateArray } from './validate';
import {
    TBundleParams,
    THandle,
    THeaders,
    TPathname,
    TRouteData
} from '../types';

export function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }

    return params.shift() as string;
}

export function extractPathname (params: unknown[], url: TPathname = '/'): TPathname {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return url;
    }

    return params.shift() as TPathname;
}

export function getParts (pathname: string): string[] {
    const parts = pathname.split('/').filter(part => !!part);
    const wildIndex = parts.indexOf('**');

    if (wildIndex > -1) {
        return parts.slice(0, wildIndex + 1);
    }

    return parts;
}

export function extractContentType (params: unknown[]): string | undefined {
    if (typeof params[0] !== 'string') {
        return undefined;
    }

    return params.shift() as string;
}

export function extractHandles (params: unknown[]): THandle[] {
    const handles = params.flat(Infinity);

    validateArray(handles, 'Handle', 'function');

    return handles as THandle[];
}

export function extractOptions<T> (params: unknown[], defaultOptions?: T): T {
    if (typeof params[0] !== 'object' || params[0] === null || Array.isArray(params[0])) {
        return { ...defaultOptions } as T;
    }

    return { ...defaultOptions, ...(params.shift() as T) };
}

export function extractParams (parts: string[], route?: TRouteData): TBundleParams {
    const params: TBundleParams = {};

    if (route !== undefined) {
        for (let i = 0; i < route.parts.length; i++) {
            if (route.parts[i] === '**') {
                params['**'] = parts.slice(i);
                return params;
            }

            if (route.parts[i][0] === ':') {
                params[route.parts[i].substring(1)] = parts[i];
            }
        }
    }

    return params;
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

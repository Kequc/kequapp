import { validateArray } from './validate';
import { TPathname } from '../types';

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

export function extractContentType (params: unknown[], contentType = '*'): string {
    if (typeof params[0] !== 'string') {
        return contentType;
    }

    return params.shift() as string;
}

export function extractHandles<T> (params: unknown[]): T[] {
    const handles = params.flat(Infinity);

    validateArray(handles, 'Handle', 'function');

    return handles as T[];
}

export function extractOptions<T> (params: unknown[], defaultOptions?: T): T {
    if (typeof params[0] !== 'object' || params[0] === null || Array.isArray(params[0])) {
        return { ...defaultOptions } as T;
    }

    return { ...defaultOptions, ...(params.shift() as T) };
}

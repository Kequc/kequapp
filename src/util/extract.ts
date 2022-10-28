import { validateArray } from './validate';
import { TParams, TPathname, TRouteData } from '../types';

export function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }

    return params.shift() as string;
}

export function extractUrl (params: unknown[], url: TPathname = '/'): TPathname {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return url;
    }

    return params.shift() as TPathname;
}

export function extractContentType<T> (params: unknown[], contentType: T): string | T {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return contentType;
    }

    return params.shift() as T;
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

export function getParts (pathname: string): string[] {
    const parts = pathname.split('/').filter(part => !!part);
    const wildIndex = parts.indexOf('**');

    if (wildIndex > -1) {
        return parts.slice(0, wildIndex + 1);
    }

    return parts;
}

export function getParams (pathname: string, route?: TRouteData): TParams {
    const clientParts = getParts(pathname);
    const params: TParams = {};
    const parts = route?.parts || [];

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '**') {
            params['**'] = `/${clientParts.slice(i).join('/')}`;
            return params;
        }

        if (parts[i][0] === ':') {
            params[parts[i].substring(1)] = clientParts[i];
        }
    }

    return params;
}

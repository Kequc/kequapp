import type { TParams, TPathname } from '../../types.ts';
import {
    CONTENT_TYPE_REGEX,
    PATHNAME_REGEX,
    validateArray,
} from '../../util/validate.ts';

export function extractMethod(params: unknown[], method = 'GET'): string {
    if (typeof params[0] !== 'string' || params[0].includes('/')) {
        return method;
    }

    return params.shift() as string;
}

export function extractUrl(params: unknown[], url: TPathname = '/'): TPathname {
    if (typeof params[0] !== 'string' || !PATHNAME_REGEX.test(params[0])) {
        return url;
    }

    return params.shift() as TPathname;
}

export function extractContentType(
    params: unknown[],
    contentType?: string,
): string | undefined {
    if (typeof params[0] !== 'string' || !CONTENT_TYPE_REGEX.test(params[0])) {
        return contentType;
    }

    return params.shift() as string;
}

export function extractActions<T>(params: unknown[]): T[] {
    const actions = params.flat(Infinity);

    validateArray(actions, 'Action', 'function');

    return actions as T[];
}

export function extractOptions<T>(
    params: unknown[],
    defaultOptions?: Partial<T>,
): T {
    if (
        typeof params[0] !== 'object' ||
        params[0] === null ||
        Array.isArray(params[0])
    ) {
        return { ...defaultOptions } as T;
    }

    return { ...defaultOptions, ...(params.shift() as T) };
}

export function getParts(pathname?: string): string[] {
    if (pathname === undefined) return [];

    const parts = pathname.split('/').filter((value) => value !== '');

    const wildIndex = parts.indexOf('**');
    if (wildIndex > -1) {
        return parts.slice(0, wildIndex + 1);
    }

    return parts;
}

export function getParams(clientParts: string[], parts: string[]): TParams {
    const params: TParams = {};

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

export function matchGroups(url: string, regexp: RegExp): TParams {
    return Object.assign({}, url.match(regexp)?.groups);
}

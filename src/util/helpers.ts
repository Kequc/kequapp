import { validateArray } from './validate';
import { TBundleParams, THandle, TRouteData } from '../types';

export function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }

    return params.shift() as string;
}

export function extractParts (params: unknown[], isWild = false): string[] {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return isWild ? ['**'] : [];
    }

    return getParts(params.shift() as string);
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

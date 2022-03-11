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

type TSortable = { parts: string[], contentType?: string };

export function priority (a: TSortable, b: TSortable): number {
    if (a.parts.join('/') === b.parts.join('/')) {
        if (a.contentType && b.contentType) {
            const aa = a.contentType.indexOf('*');
            const bb = b.contentType.indexOf('*');

            if (aa > -1 && bb > -1) return bb - aa;
            if (aa > -1) return 1;
            if (bb > -1) return -1;
        }

        return 0;
    }

    for (let i = 0; i < a.parts.length; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];

        if (aa === bb)  continue;

        if (bb === undefined) return 1;
        if (aa === '**' || aa[0] === ':') return 1;
        if (bb === '**' || bb[0] === ':') return -1;

        return aa.localeCompare(bb);
    }

    return -1;
}

export function extractParams (route: TRouteData, parts: string[]): TBundleParams {
    const params: TBundleParams = {};

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') {
            params['**'] = parts.slice(i);
            return params;
        }

        if (route.parts[i][0] === ':') {
            params[route.parts[i].substring(1)] = parts[i];
        }
    }

    return params;
}

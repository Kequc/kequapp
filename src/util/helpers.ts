import { validateArray } from './validate';
import { THandle, TRouteData } from '../types';

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

export function extractHandles (params: unknown[]): THandle[] {
    const handles = params.flat(Infinity);

    validateArray(handles, 'Handle', 'function');

    return handles as THandle[];
}

type TSortable = { parts: string[] };

export function priority (a: TSortable, b: TSortable): number {
    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
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

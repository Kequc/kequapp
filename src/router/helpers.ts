import { TAddableData, THandle } from '../types';
import { validateArray, validateObject, validateType } from '../util/validate';

export function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }

    return params.shift() as string;
}

export function extractParts (params: unknown[]): string[] {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return [];
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

export function priority (a: TAddableData, b: TAddableData): number {
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

export function validateAdding (added: TAddableData[], adding: TAddableData[]): void {
    const checked: TAddableData[] = [...added];

    for (const data of adding) {
        validateObject(data, 'Add');
        validateArray(data.parts, 'Parts', 'string');
        validateArray(data.handles, 'Handles', 'function');
        validateType(data.method, 'Method', 'string');
        validateArray(data.renderers, 'Renderers', 'object');
        validateType(data.errorHandler, 'Error handler', 'function');

        if (data.parts.length > 0) {
            const exists = checked.find(existing => isDuplicate(existing, data));

            if (exists) {
                console.error('Route already exists', {
                    method: data.method,
                    pathname: `/${data.parts.join('/')}`,
                    matches: `/${exists.parts.join('/')}`
                });

                throw new Error('Route already exists');
            }

            checked.push(data);
        }

        for (const renderer of data.renderers) {
            validateType(renderer.mime, 'Mime', 'string');
            validateType(renderer.handle, 'Handle', 'function');
        }
    }
}

function isDuplicate (a: TAddableData, b: TAddableData): boolean {
    if (a.method !== b.method || a.parts.length !== b.parts.length) {
        return false;
    }

    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];
        if (aa === bb) continue;
        if ((aa === '**' || aa[0] === ':') && (bb === '**' || bb[0] === ':')) continue;
        return false;
    }

    return true;
}

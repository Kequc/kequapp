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

export function extractOptions (params: unknown[]): Partial<TConfig> {
    if (typeof params[0] !== 'object' || typeof params[0] === null) {
        return {};
    }

    return params.shift() as Partial<TConfig>;
}

export function extractHandles (params: unknown[]): THandle[] {
    const handles = params.flat(Infinity);
    const invalid = handles.find(handle => typeof handle !== 'function');

    if (invalid) {
        throw new Error('Handle must be a function got ' + typeof invalid);
    }

    return handles as THandle[];
}

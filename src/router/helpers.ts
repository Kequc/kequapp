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
    const invalid = handles.find(handle => typeof handle !== 'function');

    if (invalid) {
        throw new Error('Handle must be a function got ' + typeof invalid);
    }

    return handles as THandle[];
}

export function findRoute (routes: TRouteData[], parts: string[], method?: string): TRouteData | undefined {
    return routes.find(route => compareRoute(route, parts, method));
}

export function compareRoute (route: TRouteData | TRoute, parts: string[], method?: string): boolean {
    if (method !== undefined && method !== route.method) {
        return false;
    }

    if (!route.parts.includes('**') && route.parts.length !== parts.length) {
        return false;
    }

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') return true;
        if (route.parts[i][0] === ':') continue;
        if (route.parts[i] === parts[i]) continue;
        return false;
    }

    return true;
}

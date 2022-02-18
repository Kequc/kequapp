import { compareRoute } from '../util/path-params';

export function extractParts (params: unknown[]): string[] {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return [];
    }

    return getParts(params.shift() as string);
}

export function getParts (pathname: string): string[] {
    return pathname.split('/').filter(part => !!part);
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

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

export function extractParams (route: TRouteData | TRoute, parts: string[]): TBundleParams {
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

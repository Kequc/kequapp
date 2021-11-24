import { Route } from './create-router';
import { BundleParams } from '../main';

export function compareRoute (route: Route, parts: string[], method?: string): boolean {
    if (method !== undefined && method !== route.method) {
        return false;
    }

    if (!route.isWild && route.parts.length !== parts.length) {
        return false;
    }

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') return true;
        if (route.parts[i] === '*') continue;
        if (route.parts[i][0] === ':') continue;
        if (route.parts[i] === parts[i]) continue;
        return false;
    }

    return true;
}

export function extractParams (route: Route, parts: string[]): BundleParams {
    const params: BundleParams = {};

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') {
            params['**'] = parts.slice(i);
            return params;
        }

        if (route.parts[i] === '*') {
            params['*'] = params['*'] || [];
            params['*'].push(parts[i]);
        }

        if (route.parts[i][0] === ':') {
            params[route.parts[i].substr(1)] = parts[i];
        }
    }

    return params;
}

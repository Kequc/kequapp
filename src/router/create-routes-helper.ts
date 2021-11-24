import { Route } from './create-router';
import { compareRoute } from './path-params';
import Ex from '../utils/ex';
import { getParts } from '../utils/sanitize';


export type RoutesHelper = {
    list (): Route[];
    methods (pathname: string): string[];
    print (): string[];
};


function createRoutesHelper (routes: Route[]): RoutesHelper {
    function list (): Route[] {
        return listRoutes(routes).map(route => ({ ...route }));
    }

    function methods (pathname: string): string[] {
        return findRoutes(routes, getParts(pathname)).map(({ method }) => method);
    }

    function print (): string[] {
        return list().map(({ method, parts }) => `${method} /${parts.join('/')}`);
    }

    return {
        list,
        methods,
        print
    };
}

export default createRoutesHelper;

export function findRoute (routes: Route[], method: string | undefined, pathname: string, autoHead: boolean): Route {
    const result = findRoutes(routes, getParts(pathname));
    let match = result.find(route => route.method === (method || 'GET'));

    // maybe it's a head request
    if (!match && autoHead && method === 'HEAD') {
        match = result.find(route => route.method === 'GET');
    }

    if (!match) {
        throw Ex.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname },
            routes: createRoutesHelper(routes).print()
        });
    }

    return match;
}

function findRoutes (routes: Route[], parts: string[]): Route[] {
    return routes.filter(route => compareRoute(route, parts));
}

function listRoutes (routes: Route[]): Route[] {
    return [...routes].sort((a: Route, b: Route) =>
        (a.parts.join('/') + a.method).localeCompare(b.parts.join('/') + b.method));
}

import { Route } from './create-router';
import { comparePathnames } from './path-params';
import Ex from '../utils/ex';


export type RoutesHelper = {
    list (): RouteSummary[];
    methods (pathname: string): string[];
    print (): string[];
};
type RouteSummary = {
    method: string;
    pathname: string;
};


function createRoutesHelper (routes: Route[]): RoutesHelper {
    function list (): RouteSummary[] {
        return listRoutes(routes).map(({ method, pathname }) => ({ method, pathname }));
    }

    function methods (pathname: string): string[] {
        return findRoutes(routes, pathname).map(({ method }) => method);
    }

    function print (): string[] {
        return list().map(({ method, pathname }) => `${method} ${pathname}`);
    }

    return {
        list,
        methods,
        print
    };
}

export default createRoutesHelper;

export function findRoute (routes: Route[], method: string | undefined, pathname: string, autoHead: boolean): Route {
    const result = findRoutes(routes, pathname);
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

export function findRoutes (routes: Route[], pathname: string): Route[] {
    return routes.filter(route => comparePathnames(route.pathname, pathname));
}

export function listRoutes (routes: Route[]): Route[] {
    return [...routes].sort((a: Route, b: Route) =>
        (a.pathname + a.method).localeCompare(b.pathname + b.method));
}

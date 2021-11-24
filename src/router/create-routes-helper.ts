import { Route } from './create-router';
import { compareRoute } from './path-params';
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

export function findRoute (routes: Route[], parts: string[], method?: string): Route | undefined {
    return routes.find(route => compareRoute(route, parts, method));
}

function findRoutes (routes: Route[], parts: string[]): Route[] {
    return routes.filter(route => compareRoute(route, parts));
}

function listRoutes (routes: Route[]): Route[] {
    return [...routes].sort((a: Route, b: Route) =>
        (a.parts.join('') + a.method).localeCompare(b.parts.join('') + b.method));
}

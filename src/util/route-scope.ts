import path from 'path';

import { Bundle } from '../main';


export type RouteScope = {
    route: IRouteScopeRoute;
    branch: IRouteScopeBranch;
    middleware: IRouteScopeMiddleware;
};
export type RouteBuilder = {
    pathname: string;
    handles: Handle[];
};
export type Route = RouteBuilder & {
    method: string;
};
export type Handle = (bundle: Bundle) => Promise<any> | any;
export interface IRouteScopeRoute {
    (method: string, pathname: string, ...handles: Handle[]): RouteScope;
    (method: string, ...handles: Handle[]): RouteScope;
    (pathname: string, ...handles: Handle[]): RouteScope;
    (...handles: Handle[]): RouteScope;
}
export interface IRouteScopeBranch {
    (pathname: string, ...handles: Handle[]): RouteScope;
    (...handles: Handle[]): RouteScope;
}
export interface IRouteScopeMiddleware {
    (...handles: Handle[]): RouteScope;
}


function routeScope (routes: Route[], parent: RouteBuilder): RouteScope {
    const scope: any = {
        route: undefined,
        branch: undefined,
        middleware: undefined
    };
    scope.route = buildRoute(routes, parent, scope);
    scope.branch = buildBranch(routes, parent);
    scope.middleware = buildMiddleware(parent, scope);
    return scope as RouteScope;
}

export default routeScope;

function buildBranch (routes: Route[], parent: RouteBuilder): IRouteScopeBranch {
    return function branch (...params: unknown[]) {
        const pathname = extractPathname(params);
        const handles = params.flat(Infinity) as Handle[];

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const newParent = routeMerge(parent, {
            pathname,
            handles
        });

        return routeScope(routes, newParent);
    };
}

function buildMiddleware (parent: RouteBuilder, scope: RouteScope): IRouteScopeMiddleware {
    return function middleware (...params: unknown[]) {
        const handles = params.flat(Infinity) as Handle[];

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        Object.assign(parent, routeMerge(parent, {
            pathname: '/',
            handles
        }));

        return scope;
    };
}

function buildRoute (routes: Route[], parent: RouteBuilder, scope: RouteScope): IRouteScopeRoute {
    return function route (...params: unknown[]) {
        const method = extractMethod(params);
        const pathname = extractPathname(params);
        const handles = params.flat(Infinity) as Handle[];

        if (handles.length < 1) {
            throw new Error('Route must have at least one handle');
        }
        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const route: Route = Object.assign({ method }, routeMerge(parent, {
            pathname,
            handles
        }));

        routes.push(route as Route);

        return scope;
    };
}

function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }
    return params.shift() as string;
}

function extractPathname (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return '/';
    }
    return params.shift() as string;
}

function routeMerge (parent: RouteBuilder, child: RouteBuilder): RouteBuilder {
    return {
        pathname: path.join(parent.pathname, child.pathname),
        handles: parent.handles.concat(child.handles)
    };
}

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
    return function branch (...handles: unknown[]) {
        const pathname = extractPathname(handles);

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const newParent = routeMerge(parent, {
            pathname,
            handles: handles as Handle[]
        });

        return routeScope(routes, newParent);
    };
}

function buildMiddleware (parent: RouteBuilder, scope: RouteScope): IRouteScopeMiddleware {
    return function middleware (...handles: unknown[]) {
        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        Object.assign(parent, routeMerge(parent, {
            pathname: '/',
            handles: handles as Handle[]
        }));

        return scope;
    };
}

function buildRoute (routes: Route[], parent: RouteBuilder, scope: RouteScope): IRouteScopeRoute {
    return function route (...handles: unknown[]) {
        const method = extractMethod(handles);
        const pathname = extractPathname(handles);

        if (handles.length < 1) {
            throw new Error('Route must have at least one handle');
        }
        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const route: Route = Object.assign({ method }, routeMerge(parent, {
            pathname,
            handles: handles as Handle[]
        }));

        routes.push(route as Route);

        return scope;
    };
}

function extractMethod (handles: unknown[]): string {
    if (typeof handles[0] !== 'string' || handles[0][0] === '/') {
        return 'GET';
    }
    return handles.shift() as string;
}

function extractPathname (handles: unknown[]): string {
    if (typeof handles[0] !== 'string' || handles[0][0] !== '/') {
        return '/';
    }
    return handles.shift() as string;
}

function routeMerge (parent: RouteBuilder, child: RouteBuilder): RouteBuilder {
    return {
        pathname: path.join(parent.pathname, child.pathname),
        handles: parent.handles.concat(child.handles)
    };
}

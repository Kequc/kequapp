import path from 'path';

import { Handle, HandlesInput, HandlesInputRoute, Route, RouteBuilder, RouteScope } from '../../types/route-scope';

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

function buildBranch (routes: Route[], parent: RouteBuilder) {
    return function branch (...handles: HandlesInput): RouteScope {
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

function buildMiddleware (parent: RouteBuilder, scope: RouteScope) {
    return function middleware (...handles: HandlesInput): RouteScope {
        const pathname = extractPathname(handles);

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        Object.assign(parent, routeMerge(parent, {
            pathname,
            handles: handles as Handle[]
        }));

        return scope;
    };
}

function buildRoute (routes: Route[], parent: RouteBuilder, scope: RouteScope) {
    return function route (...handles: HandlesInputRoute): RouteScope {
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

function extractMethod (handles: HandlesInput | HandlesInputRoute): string {
    if (typeof handles[0] !== 'string' || handles[0][0] === '/') {
        return 'GET';
    }
    return handles.shift() as string;
}

function extractPathname (handles: HandlesInput | HandlesInputRoute): string {
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

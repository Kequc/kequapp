import { ServerBundle } from 'index';
import path from 'path';

export type MethodScope = {
    route: (...handles: HandlesInputRoute) => MethodScope;
    branch: (...handles: HandlesInput) => MethodScope;
    middleware: (...handles: HandlesInput) => MethodScope;
};

type ServerRouteBuilder = {
    pathname: string;
    handles: ServerHandle[];
};

export type ServerRoute = ServerRouteBuilder & {
    method: string;
};

export type ServerHandle = (bundle: ServerBundle) => any;

type HandlesInput = [
    pathname: string | ServerHandle,
    ...handles: ServerHandle[]
];

type HandlesInputRoute = [
    method: string | ServerHandle,
    pathname?: string | ServerHandle,
    ...handles: ServerHandle[]
];

function buildMethodScope (routes: ServerRoute[], parent: ServerRouteBuilder) {
    const scope: any = {
        route: undefined,
        branch: undefined,
        middleware: undefined
    };
    scope.route = buildRoute(routes, parent, scope);
    scope.branch = buildBranch(routes, parent);
    scope.middleware = buildMiddleware(parent, scope);
    return scope as MethodScope;
}

export default buildMethodScope;

function buildBranch (routes: ServerRoute[], parent: ServerRouteBuilder) {
    return function branch (...handles: HandlesInput): MethodScope {
        const pathname = extractPathname(handles);

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function')
        }

        const newParent = routeMerge(parent, {
            pathname,
            handles: handles as ServerHandle[]
        });

        return buildMethodScope(routes, newParent);
    };
}

function buildMiddleware (parent: ServerRouteBuilder, scope: MethodScope) {
    return function middleware (...handles: HandlesInput): MethodScope {
        const pathname = extractPathname(handles);

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function')
        }

        Object.assign(parent, routeMerge(parent, {
            pathname,
            handles: handles as ServerHandle[]
        }));

        return scope;
    };
}

function buildRoute (routes: ServerRoute[], parent: ServerRouteBuilder, scope: MethodScope) {
    return function route (...handles: HandlesInputRoute): MethodScope {
        const method = extractMethod(handles);
        const pathname = extractPathname(handles);

        if (handles.length < 1) {
            throw new Error('Route must have at least one handle');
        }
        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function')
        }

        const route: ServerRoute = Object.assign({ method }, routeMerge(parent, {
            pathname,
            handles: handles as ServerHandle[]
        }));

        routes.push(route as ServerRoute);

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

function routeMerge (parent: ServerRouteBuilder, child: ServerRouteBuilder): ServerRouteBuilder {
    return {
        pathname: path.join(parent.pathname, child.pathname),
        handles: parent.handles.concat(child.handles)
    };
}

import path from 'path';
import { Bundle } from '../main';


export type Router = {
    route: IRouterRoute;
    branch: IRouterBranch;
};
export type RouteBuilder = {
    pathname: string;
    handles: Handle[];
};
export type Route = RouteBuilder & {
    method: string;
};
export type Handle = (bundle: Bundle) => Promise<any> | any;
export interface IRouterRoute {
    (method: string, pathname: string, ...handles: Handle[]): Router;
    (method: string, ...handles: Handle[]): Router;
    (pathname: string, ...handles: Handle[]): Router;
    (...handles: Handle[]): Router;
}
export interface IRouterBranch {
    (pathname: string, ...handles: Handle[]): Router;
    (...handles: Handle[]): Router;
}


function createRouter (routes: Route[], parent: RouteBuilder): Router {
    const scope: any = {
        route: undefined,
        branch: undefined,
    };
    scope.route = buildRoute(routes, parent, scope);
    scope.branch = buildBranch(routes, parent);
    return scope as Router;
}

export default createRouter;

function buildBranch (routes: Route[], parent: RouteBuilder): IRouterBranch {
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

        return createRouter(routes, newParent);
    };
}

function buildRoute (routes: Route[], parent: RouteBuilder, scope: Router): IRouterRoute {
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

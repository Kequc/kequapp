import { Bundle, Ex } from '../main';
import { getParts } from '../utils/sanitize';
import { findRoute } from './create-routes-helper';


export type Router = {
    route: IRouterRoute;
    branch: IRouterBranch;
};
export type RouteBuilder = {
    parts: string[];
    handles: Handle[];
    isWild: boolean;
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
        const parts = extractParts(params);
        const handles = params.flat(Infinity) as Handle[];

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const newParent = routeMerge(parent, routeMake(parts, handles));
        return createRouter(routes, newParent);
    };
}

function buildRoute (routes: Route[], parent: RouteBuilder, scope: Router): IRouterRoute {
    return function route (...params: unknown[]) {
        const method = extractMethod(params);
        const parts = extractParts(params);
        const handles = params.flat(Infinity) as Handle[];

        if (handles.find(handle => typeof handle !== 'function')) {
            throw new Error('Handle must be a function');
        }

        const newRoute = routeMerge(parent, routeMake(parts, handles));
        const route: Route = { ...newRoute, method };
        const exists = findRoute(routes, route.parts, method);

        if (exists) {
            throw Ex.InternalServerError('Route already exists', {
                method,
                pathname: '/' + route.parts.join('/'),
                matches: '/' + exists.parts.join('/')
            });
        }

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

function extractParts (params: unknown[]): string[] {
    if (typeof params[0] !== 'string' || params[0][0] !== '/') {
        return [];
    }
    return getParts(params.shift() as string);
}

function routeMerge (parent: RouteBuilder, child: RouteBuilder): RouteBuilder {
    const parts = [...parent.parts, ...child.parts];
    const handles = parent.handles.concat(child.handles);

    return routeMake(parts, handles);
}

function routeMake (parts: string[], handles: Handle[]): RouteBuilder {
    return {
        parts,
        handles,
        isWild: parts.includes('**')
    };
}

import { Bundle } from './main';

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
    (pathname: string, ...handles: Handle[]): RouteScope;
    (...handles: Handle[]): RouteScope;
}

import { Bundle } from './main';

export type RouteScope = {
    route: (...handles: HandlesInputRoute) => RouteScope;
    branch: (...handles: HandlesInput) => RouteScope;
    middleware: (...handles: HandlesInput) => RouteScope;
};

export type RouteBuilder = {
    pathname: string;
    handles: Handle[];
};

export type Route = RouteBuilder & {
    method: string;
};

export type Handle = (bundle: Bundle) => any;

export type HandlesInput = [
    pathname: string | Handle,
    ...handles: Handle[]
];

export type HandlesInputRoute = [
    method: string | Handle,
    pathname?: string | Handle,
    ...handles: Handle[]
];

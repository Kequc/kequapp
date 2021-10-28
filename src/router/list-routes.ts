import { Route } from './create-router';

function listRoutes (routes: Route[]): string[] {
    return [...routes].sort(routeSorter).map(formatRoute);
}

export default listRoutes;

function routeSorter (a: Route, b: Route) {
    return (a.pathname + a.method).localeCompare(b.pathname + b.method);
}

function formatRoute ({ method, pathname }: { method: string, pathname: string }) {
    return `${method} ${pathname}`;
}

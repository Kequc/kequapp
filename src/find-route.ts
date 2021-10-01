import { ServerRoute } from 'util/build-method-scope.js';
import errors from './util/errors.js';

function findRoute (routes: ServerRoute[], method: string | undefined, pathname: string) {
    // exactly the route
    let result: ServerRoute | undefined = routes.find(routeMatch(method || 'GET', pathname));

    // maybe it's a head request
    if (!result && method === 'HEAD') {
        result = routes.find(routeMatch('GET', pathname));
    }

    if (!result) {
        throw errors.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname },
            routes: [...routes].sort(routeSorter).map(formatRoute)
        });
    }

    return result;
}

export default findRoute;

function routeMatch (method: string, pathname: string) {
    return function (route: ServerRoute) {
        if (route.method !== method) {
            return false;
        }
        return comparePathnames(route.pathname, pathname);
    };
}

function comparePathnames (srcPathname: string, reqPathname: string) {
    const srcParts = srcPathname.split('/').filter(part => !!part);
    const reqParts = reqPathname.split('/').filter(part => !!part);
    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i] === '**') return true;
        if (srcParts[i] === '*') continue;
        if (srcParts[i].startsWith(':')) continue;
        if (srcParts[i] === reqParts[i]) continue;
        return false;
    }
    return srcParts.length === reqParts.length;
}

function routeSorter (a: ServerRoute, b: ServerRoute) {
    return (a.pathname + a.method).localeCompare(b.pathname + b.method);
}

function formatRoute ({ method, pathname }: { method: string, pathname: string }) {
    return `${method} ${pathname}`;
}

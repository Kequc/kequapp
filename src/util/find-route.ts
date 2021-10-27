import Ex from './ex';
import { comparePathnames } from './path-params';
import { Route } from './route-scope';
import { listRoutes } from '../processor';

function findRoute (routes: Route[], method: string | undefined, pathname: string): Route {
    // exactly the route
    let result: Route | undefined = routes.find(routeMatch(method || 'GET', pathname));

    // maybe it's a head request
    if (!result && method === 'HEAD') {
        result = routes.find(routeMatch('GET', pathname));
    }

    if (!result) {
        throw Ex.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname },
            routes: listRoutes(routes)
        });
    }

    return result;
}

export default findRoute;

function routeMatch (method: string, pathname: string) {
    return function (route: Route) {
        if (route.method !== method) {
            return false;
        }
        return comparePathnames(route.pathname, pathname);
    };
}

import createRouteManager from './create-route-manager';
import {
    TBundle,
    TBundleParams,
    TRoute,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getParts } from '../util/helpers';

export default async function requestProcessor (routes: TRouteData[], bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;
    const method = req.method;
    const pathname = url.pathname;
    const routeManager = createRouteManager(routes, bundle);
    const route = routeManager(pathname).find(route => route.method === method);

    if (!route) {
        // 404
        throw Ex.NotFound();
    }

    Object.assign(bundle.params, extractParams(route, getParts(pathname)));
    Object.freeze(bundle);

    await route.lifecycle();

    console.debug(res.statusCode, method, pathname);
}

function extractParams (route: TRoute, parts: string[]): TBundleParams {
    const params: TBundleParams = {};

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') {
            params['**'] = parts.slice(i);
            return params;
        }

        if (route.parts[i][0] === ':') {
            params[route.parts[i].substring(1)] = parts[i];
        }
    }

    return params;
}

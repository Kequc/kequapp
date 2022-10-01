import { ServerResponse } from 'http';
import { renderError, renderRoute } from './actions';
import Ex from '../util/tools/ex';
import { getParams } from '../util/extract';
import {
    IRouter,
    TBundle,
    TConfig,
    TRawBundle,
    TRouteData
} from '../types';

export default async function requestProcessor (router: IRouter, config: TConfig, raw: TRawBundle): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    const collection = router(pathname);
    const route = findRoute(config, collection.routes, method);
    const bundle: TBundle = Object.freeze({
        ...raw,
        params: getParams(pathname, route),
        methods: getMethods(config, collection.routes),
        context: {}
    });

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await renderRoute(collection, bundle, route, config);

        cleanup(res);
    } catch (error) {
        try {
            await renderError(collection, bundle, error);
        } catch (fatalError) {
            res.statusCode = 500;

            console.error(fatalError);
        }

        cleanup(res);
    }

    if (!config.silent) {
        // debug request
        console.debug(res.statusCode, method, pathname);
    }
}

function findRoute (config: TConfig, routes: TRouteData[], method: string): TRouteData | undefined {
    const route = routes.find(route => route.method === method);

    if (config.autoHead && !route && method === 'HEAD') {
        return findRoute(config, routes, 'GET');
    }

    return route;
}

function getMethods (config: TConfig, routes: TRouteData[]): string[] {
    const result = new Set(routes.map(route => route.method));

    if (config.autoHead && result.has('GET')) result.add('HEAD');

    return [...result].sort();
}

function cleanup (res: ServerResponse): void {
    if (!res.writableEnded) {
        res.end();
    }
}

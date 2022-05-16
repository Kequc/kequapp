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
        context: {}
    });

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await renderRoute(collection, bundle, route, config);

        cleanup(res, 204);
    } catch (error) {
        try {
            await renderError(collection, bundle, error);
        } catch (fatalError) {
            console.error(fatalError);
        }

        cleanup(res, 500);
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

function cleanup (res: ServerResponse, statusCode: number): void {
    if (!res.writableEnded) {
        res.statusCode = statusCode;
        if (!res.getHeader('Content-Length')) res.setHeader('Content-Length', 0);
        res.end();
    }
}

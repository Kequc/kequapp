import { ServerResponse } from 'http';
import { renderError, renderRoute } from './actions';
import {
    IRouter,
    TBundle,
    TConfig,
    TRawBundle,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getParams } from '../util/extract';

export default async function requestProcessor (router: IRouter, config: TConfig, raw: TRawBundle): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    const collection = router(pathname);
    const route = findRoute(collection.routes, config, method);
    console.log(route);
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

function findRoute (routes: TRouteData[], config: TConfig, method: string): TRouteData | undefined {
    const route = routes.find(route => route.method === method);

    if (!route && config.autoHead && method === 'HEAD') {
        return findRoute(routes, config, 'GET');
    }

    return route;
}

function cleanup (res: ServerResponse, statusCode: number): void {
    if (!res.writableEnded) {
        res.statusCode = statusCode;
        res.setHeader('Content-Length', 0);
        res.end();
    }
}

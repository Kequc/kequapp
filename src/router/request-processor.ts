import { IncomingMessage, ServerResponse } from 'http';
import { renderError, renderRoute } from './actions';
import Ex from '../util/tools/ex';
import { getParams } from '../util/extract';
import { IRouter, TBundle, TConfig, TRouteData } from '../types';
import createGetBody from '../body/create-get-body';

export default async function requestProcessor (router: IRouter, config: TConfig, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
    const method = req.method || 'GET';
    const pathname = url.pathname;
    const collection = router(pathname);
    const route = findRoute(config, collection.routes, method);

    const bundle: TBundle = Object.freeze({
        req,
        res,
        url,
        context: {},
        params: getParams(pathname, route),
        methods: getMethods(config, collection.routes),
        getBody: createGetBody(req),
        logger: config.logger
    });

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await renderRoute(collection, bundle, route);

        cleanup(res);
    } catch (error) {
        try {
            await renderError(collection, bundle, error);
        } catch (fatalError) {
            res.statusCode = 500;

            config.logger.error(fatalError);
        }

        cleanup(res);
    }

    // debug request
    config.logger.debug(res.statusCode, method, pathname);
}

function findRoute (config: TConfig, routes: TRouteData[], method: string): TRouteData | undefined {
    const route = routes.find(route => route.method === method);

    if (config.autoHead && !route && method === 'HEAD') {
        return routes.find(route => route.method === 'GET');
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

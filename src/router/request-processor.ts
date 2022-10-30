import { IncomingMessage, ServerResponse } from 'http';
import { renderError, renderRoute } from './actions';
import Ex from '../util/tools/ex';
import { getParams } from '../util/extract';
import { IRouter, TBundle, TConfig, TConfigData, TRouteData } from '../types';
import createGetBody from '../body/create-get-body';
import { DEFAULT_CONFIG } from './modules/create-config';
import { warnDuplicates } from './find';

export default async function requestProcessor (router: IRouter, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
    const method = req.method || 'GET';
    const pathname = url.pathname;
    const collection = router(pathname);

    const config = getConfig(collection.configs);
    const methods = getMethods(config, collection.routes);
    const route = getRoute(config, collection.routes, method);
    const { logger } = config;

    const bundle: TBundle = Object.freeze({
        req,
        res,
        url,
        context: {},
        params: getParams(pathname, route),
        methods,
        getBody: createGetBody(req),
        logger
    });

    if (process.env.NODE_ENV !== 'production') {
        warnDuplicates(config, collection.routes);
    }

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await renderRoute(collection, bundle, route);
    } catch (error) {
        try {
            await renderError(collection, bundle, error);
        } catch (fatalError) {
            res.statusCode = 500;

            logger.error(fatalError);
        }
    }

    if (!res.writableEnded) {
        res.end();
    }

    // debug request
    logger.debug(res.statusCode, method, pathname);
}

function getConfig (configs: TConfigData[]): TConfig {
    return configs[0]?.config || DEFAULT_CONFIG;
}

function getMethods ({ autoHead }: TConfig, routes: TRouteData[]): string[] {
    const result = new Set(routes.map(route => route.method));

    if (autoHead && result.has('GET')) result.add('HEAD');

    return [...result].sort();
}

function getRoute ({ autoHead }: TConfig, routes: TRouteData[], method: string): TRouteData | undefined {
    const route = routes.find(route => route.method === method);

    if (autoHead && !route && method === 'HEAD') {
        return routes.find(route => route.method === 'GET');
    }

    return route;
}

import { findErrorHandler, findRenderer, findRoute } from './search';
import {
    IRouter,
    TBundle,
    TBundleParams,
    TRendererData,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getParts } from '../util/extract';

type TRaw = Omit<TBundle, 'params' | 'context'>;

export default async function requestProcessor (router: IRouter, raw: TRaw): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { routes, renderers, errorHandlers } = router(pathname);
    const route = findRoute(routes, method);
    const bundle: TBundle = Object.freeze({
        ...raw,
        params: getParams(getParts(pathname), route),
        context: {}
    });

    try {
        if (method === 'OPTIONS') {
            cors(bundle, routes);
        } else if (!route) {
            // 404
            throw Ex.NotFound();
        }

        const payload = await lifecycle(bundle, route);

        await render(renderers, bundle, payload);
    } catch (error: unknown) {
        const contentType = String(res.getHeader('Content-Type') || 'text/plain');
        const errorHandler = findErrorHandler(errorHandlers, contentType);
        const payload = await errorHandler(error, bundle);

        if (res.statusCode === 500) {
            console.error(error);
        }

        await render(renderers, bundle, payload);
    }

    // track request
    console.debug(res.statusCode, method, pathname);
}

function getParams (clientParts: string[], route?: TRouteData): TBundleParams {
    const params: TBundleParams = {};
    const parts = route?.parts || [];

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '**') {
            params['**'] = clientParts.slice(i);
            return params;
        }

        if (parts[i][0] === ':') {
            params[parts[i].substring(1)] = clientParts[i];
        }
    }

    return params;
}

function cors ({ req, res }: TBundle, routes: TRouteData[]): void {
    if (routes.length > 0) {
        const allowMethods = [...new Set(routes.map(route => route.method))].join(',');
        const allowHeaders = req.headers['access-control-request-headers'];

        res.setHeader('Access-Control-Allow-Methods', allowMethods);
        if (allowHeaders) res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }
}

async function lifecycle (bundle: TBundle, route?: TRouteData): Promise<unknown> {
    let payload: unknown = undefined;
    const handles = route?.handles || [];

    for (const handle of handles) {
        payload = await handle(bundle);

        if (bundle.res.writableEnded || payload !== undefined) {
            break;
        }
    }

    return payload;
}

async function render (renderers: TRendererData[], bundle: TBundle, payload: unknown): Promise<void> {
    const { req, res, url } = bundle;

    if (!res.writableEnded) {
        if (payload !== undefined) {
            const contentType = String(res.getHeader('Content-Type') || 'text/plain');
            const renderer = findRenderer(renderers, contentType);
            await renderer(payload, bundle);
        } else if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Content-Length', 0);
            res.end();
        }
    }

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            method: req.method,
            pathname: url.pathname
        });
    }
}

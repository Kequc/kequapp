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
import { getHeaderString } from '../util/header-tools';

export default async function requestProcessor (router: IRouter, raw: Omit<TBundle, 'params'>): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;
    const { routes, renderers, errorHandlers } = router(pathname);
    const route = findRoute(routes, method);
    const bundle: TBundle = Object.freeze({
        ...raw,
        params: getParams(getParts(pathname), route)
    });

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        const payload = await lifecycle(route, bundle);
        await render(renderers, payload, bundle);
    } catch (error: unknown) {
        const contentType = getHeaderString(res, 'Content-Type');
        const errorHandler = findErrorHandler(errorHandlers, contentType);
        const payload = await errorHandler(error, bundle);

        if (res.statusCode === 500) {
            console.error(error);
        }

        await render(renderers, payload, bundle);
    }

    // track request
    console.debug(res.statusCode, method, pathname);
}

function getParams (parts: string[], route?: TRouteData): TBundleParams {
    const params: TBundleParams = {};

    if (route !== undefined) {
        for (let i = 0; i < route.parts.length; i++) {
            if (route.parts[i] === '**') {
                params['**'] = parts.slice(i);
                return params;
            }

            if (route.parts[i][0] === ':') {
                params[route.parts[i].substring(1)] = parts[i];
            }
        }
    }

    return params;
}

async function lifecycle (route: TRouteData, bundle: TBundle): Promise<unknown> {
    let payload: unknown = undefined;

    for (const handle of route.handles) {
        payload = await handle(bundle);

        if (bundle.res.writableEnded || payload !== undefined) {
            break;
        }
    }

    return payload;
}

async function render (renderers: TRendererData[], payload: unknown, bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const contentType = getHeaderString(bundle.res, 'Content-Type');
        const renderer = findRenderer(renderers, contentType);
        await renderer(payload, bundle);
    }

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            method: req.method,
            pathname: url.pathname
        });
    }
}

import { findErrorHandler, findRenderer, findRoute } from './search';
import {
    IRouter,
    TBundle,
    TRawBundle,
    TRendererData,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getParams } from '../util/extract';
import cors from './cors';

export default async function requestProcessor (router: IRouter, raw: TRawBundle): Promise<void> {
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
        params: getParams(pathname, route),
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
        try {
            const contentType = String(res.getHeader('Content-Type') || 'text/plain');
            const errorHandler = findErrorHandler(errorHandlers, contentType);
            const payload = await errorHandler(error, bundle);

            await render(renderers, bundle, payload);

            if (res.statusCode === 500) {
                console.error(error);
            }
        } catch (fatal: unknown) {
            console.error(fatal);

            finalize(bundle, 500);
        }
    }

    // track request
    console.debug(res.statusCode, method, pathname);
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
    const { res } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const contentType = String(res.getHeader('Content-Type') || 'text/plain');
        const renderer = findRenderer(renderers, contentType);
        await renderer(payload, bundle);
    }

    finalize(bundle, 204);
}

function finalize ({ res }: TBundle, statusCode: number): void {
    if (!res.writableEnded) {
        res.statusCode = statusCode;
        res.setHeader('Content-Length', 0);
        res.end();
    }
}

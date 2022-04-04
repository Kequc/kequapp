import { ServerResponse } from 'http';
import cors from './cors';
import { findErrorHandler, findRenderer, findRoute } from './search';
import {
    IRouter,
    TBundle,
    THandle,
    TRawBundle,
    TRendererData
} from '../types';
import Ex from '../util/ex';
import { getParams } from '../util/extract';

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

        const handles = route?.handles || [];
        const payload = await runHandles(bundle, handles);

        await finalize(renderers, bundle, payload);
    } catch (error: unknown) {
        try {
            const errorHandler = findErrorHandler(errorHandlers, getContentType(res));
            const payload = await errorHandler(error, bundle);

            await finalize(renderers, bundle, payload);

            if (res.statusCode === 500) {
                console.error(error);
            }
        } catch (fatalError: unknown) {
            console.error(fatalError);

            always(res, 500);
        }
    }

    // track request
    console.debug(res.statusCode, method, pathname);
}

async function runHandles (bundle: TBundle, handles: THandle[]): Promise<unknown> {
    let payload: unknown = undefined;

    for (const handle of handles) {
        payload = await handle(bundle);

        if (bundle.res.writableEnded || payload !== undefined) {
            break;
        }
    }

    return payload;
}

async function finalize (renderers: TRendererData[], bundle: TBundle, payload: unknown): Promise<void> {
    const { res } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const renderer = findRenderer(renderers, getContentType(res));
        await renderer(payload, bundle);
    }

    always(res, 204);
}

function always (res: ServerResponse, statusCode: number): void {
    if (!res.writableEnded) {
        res.statusCode = statusCode;
        res.setHeader('Content-Length', 0);
        res.end();
    }
}

function getContentType (res: ServerResponse): string {
    return String(res.getHeader('Content-Type') || 'text/plain');
}

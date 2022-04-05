import { ServerResponse } from 'http';
import { options, renderError, renderRoute } from './actions';
import { findRoute } from './find';
import { IRouter, TBundle, TRawBundle } from '../types';
import Ex from '../util/ex';
import { getParams } from '../util/extract';

export default async function requestProcessor (router: IRouter, raw: TRawBundle): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const collection = router(pathname);
    const route = findRoute(collection.routes, method);
    const bundle: TBundle = Object.freeze({
        ...raw,
        params: getParams(pathname, route),
        context: {}
    });

    try {
        if (method === 'OPTIONS') {
            options(collection, bundle);
        } else if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await renderRoute(collection, bundle, route);

        cleanup(res, 204);
    } catch (error) {
        try {
            await renderError(collection, bundle, error);
        } catch (fatalError) {
            console.error(fatalError);
        }

        cleanup(res, 500);
    }

    // track request
    console.debug(res.statusCode, method, pathname);
}

function cleanup (res: ServerResponse, statusCode: number): void {
    if (!res.writableEnded) {
        res.statusCode = statusCode;
        res.setHeader('Content-Length', 0);
        res.end();
    }
}

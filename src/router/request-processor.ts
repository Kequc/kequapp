import { ServerResponse } from 'http';
import cors from './cors';
import { findRoute } from './search';
import {
    IRouter,
    TBundle,
    TRawBundle
} from '../types';
import Ex from '../util/ex';
import { getParams } from '../util/extract';
import { handleError, handleRoute } from './runner';

export default async function requestProcessor (router: IRouter, raw: TRawBundle): Promise<void> {
    const { req, res, url } = raw;
    const method = req.method || 'GET';
    const pathname = url.pathname;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const addable = router(pathname);
    const route = findRoute(addable.routes, method);
    const bundle: TBundle = Object.freeze({
        ...raw,
        params: getParams(pathname, route),
        context: {}
    });

    try {
        if (method === 'OPTIONS') {
            cors(bundle, addable.routes);
        } else if (!route) {
            // 404
            throw Ex.NotFound();
        }

        await handleRoute(addable, bundle, route);

        cleanup(res, 204);
    } catch (error) {
        try {
            await handleError(addable, bundle, error);

            cleanup(res, 204);
        } catch (fatalError) {
            console.error(fatalError);

            cleanup(res, 500);
        }
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

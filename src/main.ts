import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import createGetBody from './body/create-get-body';
import { renderError, renderRoute } from './router/actions';
import createRouter from './router/create-router';
import { IRouter, TBranchData, TBundle } from './types';

export { default as sendFile } from './built-in/helpers/send-file';
export { default as staticFile } from './built-in/helpers/static-file';
export { default as staticDirectory } from './built-in/helpers/static-directory';
export { default as Ex } from './built-in/tools/ex';
export { default as inject } from './built-in/tools/inject';
export * from './router/modules';

export function createApp (structure: TBranchData): RequestListener {
    const router = createRouter(structure);

    function app (req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, req, res);
    }

    return app;
}

async function requestProcessor (router: IRouter, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const startedAt = Date.now();
    const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
    const method = req.method || 'GET';
    const [route, params, methods] = router(method, url.pathname);
    const { logger } = route;

    const bundle: TBundle = Object.freeze({
        req,
        res,
        url,
        context: {},
        params,
        methods,
        getBody: createGetBody(req),
        logger
    });

    try {
        await renderRoute(route, bundle);
    } catch (error) {
        try {
            await renderError(route, bundle, error);
        } catch (fatalError) {
            res.statusCode = 500;
            logger.error(fatalError);
        }
    }

    if (!res.writableEnded) {
        res.end();
    }

    logger.http(res.statusCode, Date.now() - startedAt, method, url.pathname);
}

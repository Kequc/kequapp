import type { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import createGetBody from './body/create-get-body.ts';
import { renderError, renderRoute } from './router/actions.ts';
import createCookies from './router/create-cookies.ts';
import createRouter from './router/create-router.ts';
import type { BranchData, Bundle, Router } from './types.ts';

export { default as sendFile } from './built-in/helpers/send-file.ts';
export { default as staticDirectory } from './built-in/helpers/static-directory.ts';
export { default as Ex } from './built-in/tools/ex.ts';
export { default as inject } from './built-in/tools/inject.ts';
export * from './router/modules.ts';
export * from './types.ts';

export function createApp(structure: BranchData): RequestListener {
    const router = createRouter(structure);

    function app(req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, req, res);
    }

    return app;
}

async function requestProcessor(
    router: Router,
    req: IncomingMessage,
    res: ServerResponse,
): Promise<void> {
    const startedAt = Date.now();
    const url = new URL(req.url ?? '/', `${req.headers.protocol}://${req.headers.host}`);
    const method = req.method ?? 'GET';
    const [route, params, methods] = router(method, url.pathname);
    const { logger } = route;

    const bundle: Bundle = Object.freeze({
        req,
        res,
        url,
        context: {},
        params,
        methods,
        cookies: createCookies(req, res),
        getBody: createGetBody(req),
    });

    try {
        await renderRoute(route, bundle);
    } catch (error) {
        try {
            await renderError(route, bundle, error, logger);
        } catch (fatalError) {
            res.statusCode = 500;
            logger.error(fatalError);
        }
    }

    if (!res.writableEnded) {
        res.end();
    }

    logger.info(res.statusCode, Date.now() - startedAt, method, url.pathname);
}

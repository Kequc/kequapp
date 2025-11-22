import type { IncomingMessage, ServerResponse } from 'node:http';
import { createGetBody } from '../body/create-get-body.ts';
import { renderError, renderRoute } from './actions.ts';
import { createCookies } from './create-cookies.ts';
import type { Bundle, Router } from '../types.ts';

export async function requestProcessor(
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

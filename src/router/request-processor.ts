import { IncomingMessage, ServerResponse } from 'http';
import { renderError, renderRoute } from './actions';
import { getParams, getParts } from '../util/extract';
import { IRouter, TBundle } from '../types';
import createGetBody from '../body/create-get-body';

export default async function requestProcessor (router: IRouter, req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `${req.headers.protocol}://${req.headers.host}`);
    const method = req.method || 'GET';
    const clientParts = getParts(url.pathname);
    const [route, methods] = router(method, clientParts);
    const params = getParams(clientParts, route.parts);
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

    // debug request
    logger.debug(res.statusCode, method, url.pathname);
}

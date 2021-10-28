import { Route } from './create-router';
import findRoute from './find-route';
import { extractParams } from './path-params';
import { Bundle, Config } from '../main';
import render from '../render';
import { sanitizePathname } from '../utils/sanitize';

async function requestProcessor (routes: Route[], config: Config, bundle: Bundle): Promise<void> {
    const { errorHandler } = config;
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);

    try {
        const route = findRoute(routes, req.method, pathname);
        Object.assign(bundle.params, extractParams(route.pathname, pathname));

        const payload = await lifecycle(route, bundle);
        await render(config, payload, bundle);

        logger.debug(res.statusCode, req.method, pathname);
    } catch (error: unknown) {
        const payload = await errorHandler(error, bundle);
        await render(config, payload, bundle);

        logger.debug(res.statusCode, req.method, pathname);

        if (res.statusCode === 500) {
            logger.error(error);
        }
    }
}

export default requestProcessor;

async function lifecycle (route: Route, bundle: Bundle) {
    for (const handle of route.handles) {
        const payload = await handle(bundle);

        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}

import { Route } from './create-router';
import findRoute from './find-route';
import { extractParams } from './path-params';
import render from './render';
import { Bundle, Ex } from '../main';
import { sanitizePathname } from '../utils/sanitize';
import { Config } from '../utils/setup-config';

async function requestProcessor (config: Config, routes: Route[], bundle: Bundle): Promise<void> {
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);

    try {
        const route = findRoute(routes, req.method, pathname);
        Object.assign(bundle.params, extractParams(route.pathname, pathname));

        const payload = await lifecycle(route, bundle);

        if (payload !== undefined) {
            await render(config, payload, bundle);
        }

        if (!res.writableEnded) {
            throw Ex.InternalServerError('Response not finalized', {
                pathname,
                method: req.method
            });
        }
    } catch (error: unknown) {
        if (res.writableEnded) {
            // response written to client and error thrown afterward
            logger.error(error);
        } else {
            // render error
            const payload = await config.errorHandler(error, bundle);
            await render(config, payload, bundle);

            if (res.statusCode === 500) {
                logger.error(error);
            }
        }
    }

    logger.debug(res.statusCode, req.method, pathname);
}

export default requestProcessor;

async function lifecycle (route: Route, bundle: Bundle): Promise<unknown> {
    for (const handle of route.handles) {
        const payload = await handle(bundle);

        if (bundle.res.writableEnded) {
            return;
        } else if (payload !== undefined) {
            return payload;
        }
    }
}

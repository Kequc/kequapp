import findRoute from './find-route';
import { extractParams } from './path-params';
import { Route } from './router-scope';
import { Bundle, Config } from '../main';
import render from '../render';
import { sanitizePathname } from '../utils/sanitize';

async function processor (routes: Route[], config: Config, bundle: Bundle): Promise<void> {
    const { errorHandler } = config;
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);

    try {
        const route = findRoute(routes, req.method, pathname);
        Object.assign(bundle.params, extractParams(route.pathname, pathname));

        const payload = await lifecycle(route, bundle);
        await render(config, payload, bundle);

        logger.debug(res.statusCode, req.method, pathname);
    } catch (error: any) {
        const payload = await errorHandler(error, bundle);
        await render(config, payload, bundle);

        logger.debug(res.statusCode, req.method, pathname);

        if (res.statusCode === 500) {
            logger.error(error);
        }
    }
}

export default processor;

async function lifecycle (route: Route, bundle: Bundle) {
    for (const handle of route.handles) {
        const payload = await handle(bundle);

        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}

export function listRoutes (routes: Route[]): string[] {
    return [...routes].sort(routeSorter).map(formatRoute);
}

function routeSorter (a: Route, b: Route) {
    return (a.pathname + a.method).localeCompare(b.pathname + b.method);
}

function formatRoute ({ method, pathname }: { method: string, pathname: string }) {
    return `${method} ${pathname}`;
}

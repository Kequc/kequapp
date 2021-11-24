import { Route } from './create-router';
import createRoutesHelper, { findRoute } from './create-routes-helper';
import { compareRoute, extractParams } from './path-params';
import { Bundle } from '../main';
import { Config, ConfigRenderers, Renderer } from '../utils/config';
import Ex from '../utils/ex';
import {
    getHeader,
    getParts,
    sanitizeContentType,
    sanitizePathname
} from '../utils/sanitize';

async function requestProcessor (config: Config, routes: Route[], bundle: Bundle): Promise<void> {
    const { errorHandler, autoHead } = config;
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);

    try {
        const route = getRoute(routes, pathname, req.method, autoHead);
        Object.assign(bundle.params, extractParams(route, getParts(pathname)));
        const payload = await lifecycle(route, bundle);

        await render(config, payload, bundle);
    } catch (error: unknown) {
        const payload = await errorHandler(error, bundle);

        if (bundle.res.statusCode === 500) {
            logger.error(error);
        }

        await render(config, payload, bundle);
    }

    logger.debug(res.statusCode, req.method, pathname);
}

export default requestProcessor;

function getRoute (routes: Route[], pathname: string, method?: string, autoHead?: boolean): Route {
    const parts = getParts(pathname);
    const route = findRoute(routes, parts, method);
    if (route) return route;

    // maybe it's a head request
    if (autoHead && method === 'HEAD') {
        const routeb = findRoute(routes, parts, 'GET');
        if (routeb) return routeb;
    }

    throw Ex.NotFound(`Not Found: ${pathname}`, {
        request: { method, pathname },
        routes: createRoutesHelper(routes).print()
    });
}

async function lifecycle (route: Route, bundle: Bundle): Promise<unknown> {
    for (const handle of route.handles) {
        const payload = await handle(bundle);

        if (payload !== undefined || bundle.res.writableEnded) {
            return payload;
        }
    }
}

async function render (config: Config, payload: unknown, bundle: Bundle): Promise<void> {
    if (payload !== undefined && !bundle.res.writableEnded) {
        const contentType = getHeader(bundle.res, 'Content-Type');
        const renderer = findRenderer(config.renderers, contentType);
        await renderer(payload, bundle);
    }

    if (!bundle.res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            pathname: bundle.url.pathname,
            method: bundle.req.method
        });
    }
}

function findRenderer (renderers: ConfigRenderers, contentType: string): Renderer {
    const key = sanitizeContentType(contentType);

    if (renderers[key]) {
        return renderers[key];
    }

    throw Ex.InternalServerError('Renderer not found', {
        contentType
    });
}

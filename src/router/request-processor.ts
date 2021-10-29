import { Route } from './create-router';
import findRoute from './find-route';
import { extractParams } from './path-params';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';
import { Bundle, Ex } from '../main';
import { sanitizeContentType, sanitizePathname } from '../utils/sanitize';
import { Config, ConfigRenderers, Renderer } from '../utils/setup-config';

const DEFAULT_RENDERERS = {
    'application/json': jsonRenderer,
    'text/plain': textRenderer,
    'text/html': textRenderer
};

async function requestProcessor (config: Config, routes: Route[], bundle: Bundle): Promise<void> {
    const { req, res, url, logger } = bundle;
    const pathname = sanitizePathname(url.pathname);

    try {
        const route = findRoute(routes, req.method, pathname);
        Object.assign(bundle.params, extractParams(route.pathname, pathname));

        const payload = await lifecycle(route, bundle);
        await render(config, payload, bundle);
    } catch (error: unknown) {
        const payload = await config.errorHandler(error, bundle);
        await render(config, payload, bundle);
    }

    logger.debug(res.statusCode, req.method, pathname);
}

export default requestProcessor;

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
        const contentType = String(bundle.res.getHeader('Content-Type') || '');
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
    const renderer = renderers[key] || DEFAULT_RENDERERS[key];

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType
        });
    }

    return renderer;
}

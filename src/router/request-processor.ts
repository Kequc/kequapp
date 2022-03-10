import {
    IRouteManager,
    IRouter,
    TBundle,
    TBundleParams,
    TRenderer,
    TRendererData,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getParts } from '../util/helpers';
import { getHeader, sanitizeContentType } from '../util/sanitize';

export default async function requestProcessor (router: IRouter, bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;
    const method = req.method;
    const pathname = url.pathname;
    const { routes, renderers, errorHandlers } = router(pathname);
    const route = routes.find(route => route.method === method);

    console.log({ pathname, route });

    try {
        if (!route) {
            // 404
            throw Ex.NotFound();
        }

        Object.assign(bundle.params, extractParams(route, getParts(pathname)));
        Object.freeze(bundle);

        for (const handle of route.handles) {
            const payload = await handle(bundle, routeManager);

            if (payload !== undefined || bundle.res.writableEnded) {
                await render(route, payload, bundle, routeManager);
                break;
            }
        }
    } catch (error: unknown) {
        const handle = route.errorHandler!;
        const payload = await handle(error, bundle, routeManager);

        if (bundle.res.statusCode === 500) {
            console.error(error);
        }

        await render(route, payload, bundle, routeManager);
    }

    console.debug(res.statusCode, method, pathname);
}

function extractParams (route: TRouteData, parts: string[]): TBundleParams {
    const params: TBundleParams = {};

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') {
            params['**'] = parts.slice(i);
            return params;
        }

        if (route.parts[i][0] === ':') {
            params[route.parts[i].substring(1)] = parts[i];
        }
    }

    return params;
}

async function render (route: TRouteData, payload: unknown, bundle: TBundle, routeManager: IRouteManager): Promise<void> {
    const { req, res, url, } = bundle;

    if (payload !== undefined && !res.writableEnded) {
        const contentType = getHeader(res, 'Content-Type');
        const renderer = findRenderer(route.renderers, contentType);
        await renderer(payload, bundle, routeManager);
    }

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            pathname: url.pathname,
            method: req.method
        });
    }
}

function findRenderer (renderers: TRendererData[], contentType: string): TRenderer {
    const mime = sanitizeContentType(contentType);

    const renderer = renderers.find(renderer => renderer.mime === mime);

    if (renderer) {
        return renderer.handle;
    }

    throw Ex.InternalServerError('Renderer not found', {
        contentType
    });
}

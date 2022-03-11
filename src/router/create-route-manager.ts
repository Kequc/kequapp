import { Ex } from '../main';
import { IRouteManager, IRouter, TBundle, TBundleParams, TErrorHandler, TErrorHandlerData, TRenderer, TRendererData, TRouteData } from '../types';
import { getParts } from '../util/helpers';
import { getHeader, sanitizeContentType } from '../util/sanitize';

function createRouteManager (router: IRouter, raw: TBundle): IRouteManager {
    async function routeManager (method: string, pathname: string) {
        const { routes, renderers, errorHandlers } = router(pathname);
        const route = routes.find(route => route.method === method);

        try {
            if (!route) {
                // 404
                throw Ex.NotFound();
            }

            const bundle: TBundle = Object.freeze({
                ...raw,
                params: extractParams(route, getParts(pathname))
            });

            for (const handle of route.handles) {
                const payload = await handle(bundle, routeManager);

                if (payload !== undefined || bundle.res.writableEnded) {
                    await render(renderers, payload, bundle);
                    break;
                }
            }
        } catch (error: unknown) {
            const bundle: TBundle = Object.freeze({ ...raw });
            const errorHandler = findErrorHandler(errorHandlers);
            const payload = await errorHandler(error, bundle);

            if (bundle.res.statusCode === 500) {
                console.error(error);
            }

            await render(renderers, payload, bundle);
        }
    }

    return routeManager;
}

export default createRouteManager;

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

async function render (renderers: TRendererData[], payload: unknown, bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;

    if (payload !== undefined && !res.writableEnded) {
        const contentType = getHeader(res, 'Content-Type');
        const renderer = findRenderer(renderers, contentType);
        await renderer(payload, bundle);
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

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType
        });
    }

    return renderer.handle;
}

function findErrorHandler (errorHandlers: TErrorHandlerData[]): TErrorHandler {
    return errorHandlers[0]!.handle;
}

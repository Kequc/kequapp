import { Ex } from '../main';
import { IRequestProcessor, IRouter, TBundle, TErrorHandler, TErrorHandlerData, TRenderer, TRendererData } from '../types';
import { extractParams, getParts } from '../util/helpers';
import { getHeader, sanitizeContentType } from '../util/sanitize';

function createRequestProcessor (router: IRouter, raw: Omit<TBundle, 'params'>): IRequestProcessor {
    async function requestProcessor (method: string, pathname: string) {
        const {
            routes,
            renderers,
            errorHandlers
        } = router(pathname);
        const route = routes.find(route => route.method === method);
        const bundle: TBundle = Object.freeze({
            ...raw,
            params: extractParams(getParts(pathname), route)
        });

        try {
            if (!route) {
                // 404
                throw Ex.NotFound();
            }

            for (const handle of route.handles) {
                const payload = await handle(bundle, requestProcessor);

                if (bundle.res.writableEnded) {
                    break;
                } else if (payload !== undefined) {
                    await render(renderers, payload, bundle);
                    break;
                }
            }
        } catch (error: unknown) {
            const errorHandler = findErrorHandler(errorHandlers, getContentType(bundle));
            const payload = await errorHandler(error, bundle);

            if (bundle.res.statusCode === 500) {
                console.error(error);
            }

            if (!bundle.res.writableEnded) {
                await render(renderers, payload, bundle);
            }
        }
    }

    return requestProcessor;
}

export default createRequestProcessor;

function getContentType ({ res }: TBundle): string {
    return sanitizeContentType(getHeader(res, 'Content-Type'));
}

async function render (renderers: TRendererData[], payload: unknown, bundle: TBundle): Promise<void> {
    const { req, res, url } = bundle;

    const renderer = findRenderer(renderers, getContentType(bundle));
    await renderer(payload, bundle);

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            method: req.method,
            pathname: url.pathname
        });
    }
}

function findRenderer (renderers: TRendererData[], contentType: string): TRenderer {
    const renderer = renderers.find(renderer => compareContentType(renderer.contentType, contentType));

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType
        });
    }

    return renderer.handle;
}

function findErrorHandler (errorHandlers: TErrorHandlerData[], contentType: string): TErrorHandler {
    const errorHandler = errorHandlers.find(errorHandler => compareContentType(errorHandler.contentType, contentType));

    if (!errorHandler) {
        throw Ex.InternalServerError('Error handler not found', {
            contentType
        });
    }

    return errorHandler.handle;
}

function compareContentType (a: string, b: string): boolean {
    const wildIndex = a.indexOf('*');

    if (wildIndex > -1) {
        return a.slice(0, wildIndex) === b.slice(0, wildIndex);
    }

    return a === b;
}

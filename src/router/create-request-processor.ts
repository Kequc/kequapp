import {
    IRequestProcessor,
    IRouter,
    TBundle,
    TErrorHandler,
    TErrorHandlerData,
    TRenderer,
    TRendererData
} from '../types';
import Ex from '../util/ex';
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

            const lastIndex = route.handles.length - 1;

            for (let i = 0; i <= lastIndex; i++) {
                const handle = route.handles[i];
                const payload = await handle(bundle, requestProcessor);

                if (bundle.res.writableEnded || payload !== undefined || i === lastIndex) {
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

            await render(renderers, payload, bundle);
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

    if (!res.writableEnded && payload !== undefined) {
        const renderer = findRenderer(renderers, getContentType(bundle));
        await renderer(payload, bundle);
    }

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            method: req.method,
            pathname: url.pathname
        });
    }
}

function findRenderer (renderers: TRendererData[], contentType: string): TRenderer {
    const renderer = renderers.find(renderer => compare(renderer.contentType, contentType));

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType,
            availalble: renderers.map(renderer => renderer.contentType)
        });
    }

    return renderer.handle;
}

function findErrorHandler (errorHandlers: TErrorHandlerData[], contentType: string): TErrorHandler {
    const errorHandler = errorHandlers.find(errorHandler => compare(errorHandler.contentType, contentType));

    if (!errorHandler) {
        throw Ex.InternalServerError('Error handler not found', {
            contentType,
            availalble: errorHandlers.map(errorHandler => errorHandler.contentType)
        });
    }

    return errorHandler.handle;
}

function compare (a: string, b: string): boolean {
    const wildIndex = a.indexOf('*');

    if (wildIndex > -1) {
        return a.slice(0, wildIndex) === b.slice(0, wildIndex);
    }

    return a === b;
}

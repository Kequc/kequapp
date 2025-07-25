import { unknownToEx } from '../built-in/tools/ex.ts';
import type { TBundle, TRendererData, TRoute } from '../types.ts';
import { findErrorHandler, findRenderer } from './find.ts';

export async function renderRoute(
    route: TRoute,
    bundle: TBundle,
): Promise<void> {
    const { res, methods } = bundle;
    const { actions, method, renderers } = route;

    let payload: unknown;

    if (methods.includes('OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    if (method === 'OPTIONS') {
        res.statusCode = 204;
        addOptionsHeaders(bundle);
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
    }

    for (const action of actions) {
        payload = await action(bundle);

        if (res.writableEnded || payload !== undefined) {
            break;
        }
    }

    await finalize(renderers, bundle, payload);
}

export async function renderError(
    route: TRoute,
    bundle: TBundle,
    error: unknown,
): Promise<void> {
    const { errorHandlers, renderers } = route;
    const { res, logger } = bundle;

    const errorHandler = findErrorHandler(
        errorHandlers,
        getContentType(bundle),
    );
    const ex = unknownToEx(error);
    res.statusCode = ex.statusCode;

    const payload = await errorHandler(ex, bundle);

    await finalize(renderers, bundle, payload);

    if (res.statusCode === 500) {
        logger.error(error);
    }
}

function getContentType({ res }: TBundle): string {
    return String(res.getHeader('Content-Type') ?? 'text/plain');
}

function addOptionsHeaders({ req, res, methods }: TBundle): void {
    const allowMethods = methods.join(', ');
    const allowHeaders = req.headers['access-control-request-headers'];

    if (allowMethods) {
        res.setHeader('Valid', allowMethods);
        res.setHeader('Access-Control-Allow-Methods', allowMethods);
    }
    if (allowHeaders) {
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }

    res.setHeader('Content-Length', 0);
}

async function finalize(
    renderers: TRendererData[],
    bundle: TBundle,
    payload: unknown,
): Promise<void> {
    const { res } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const renderer = findRenderer(renderers, getContentType(bundle));
        await renderer(payload, bundle);
    }
}

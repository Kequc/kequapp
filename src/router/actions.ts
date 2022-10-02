import { findErrorHandler, findRenderer } from './find';
import {
    TAddableData,
    TBundle,
    TRendererData,
    TRouteData
} from '../types';
import { unknownToEx } from '../util/tools/ex';

export async function renderRoute (collection: TAddableData, bundle: TBundle, route: TRouteData): Promise<void> {
    const { renderers } = collection;
    const { res } = bundle;
    const handles = route.handles;
    let payload: unknown = undefined;

    if (bundle.methods.includes('OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    if (route.method === 'OPTIONS') {
        res.statusCode = 204;
        res.setHeader('Content-Length', 0);

        addOptionsHeaders(bundle);
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
    }

    for (const handle of handles) {
        payload = await handle(bundle);

        if (res.writableEnded || payload !== undefined) {
            break;
        }
    }

    await finalize(renderers, bundle, payload);
}

export async function renderError (collection: TAddableData, bundle: TBundle, error: unknown): Promise<void> {
    const { errorHandlers, renderers } = collection;
    const { res } = bundle;
    const errorHandler = findErrorHandler(errorHandlers, getContentType(bundle));
    const ex = unknownToEx(error);

    res.statusCode = ex.statusCode;

    const payload = await errorHandler(ex, bundle);

    await finalize(renderers, bundle, payload);

    if (res.statusCode === 500) {
        console.error(error);
    }
}

async function finalize (renderers: TRendererData[], bundle: TBundle, payload: unknown): Promise<void> {
    const { res } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const renderer = findRenderer(renderers, getContentType(bundle));
        await renderer(payload, bundle);
    }
}

function getContentType ({ res }: TBundle): string {
    return String(res.getHeader('Content-Type') || 'text/plain');
}

function addOptionsHeaders ({ req, res, methods }: TBundle): void {
    const allowMethods = methods.join(', ');
    const allowHeaders = req.headers['access-control-request-headers'];

    if (allowMethods) {
        res.setHeader('Valid', allowMethods);
        res.setHeader('Access-Control-Allow-Methods', allowMethods);
    }
    if (allowHeaders) {
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }
}

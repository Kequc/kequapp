import { findErrorHandler, findRenderer } from './find';
import {
    TAddableData,
    TBundle,
    TRendererData,
    TRouteData
} from '../types';

export async function renderRoute (collection: TAddableData, bundle: TBundle, route?: TRouteData): Promise<void> {
    const { routes, renderers } = collection;
    const { req, res } = bundle;
    const handles = route?.handles || [];
    let payload: unknown = undefined;

    if (req.method === 'OPTIONS') {
        options(routes, bundle);
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
    const payload = await errorHandler(error, bundle);

    await finalize(renderers, bundle, payload);

    if (res.statusCode === 500) {
        console.error(error);
    }
}

function getContentType ({ res }: TBundle): string {
    return String(res.getHeader('Content-Type') || 'text/plain');
}

async function finalize (renderers: TRendererData[], bundle: TBundle, payload: unknown): Promise<void> {
    const { res } = bundle;

    if (!res.writableEnded && payload !== undefined) {
        const renderer = findRenderer(renderers, getContentType(bundle));
        await renderer(payload, bundle);
    }
}

function options (routes: TRouteData[], bundle: TBundle): void {
    const { req, res } = bundle;

    const allowMethods = [...new Set(routes.map(route => route.method))].join(', ');
    if (allowMethods) {
        res.setHeader('Valid', allowMethods);
        res.setHeader('Access-Control-Allow-Methods', allowMethods);
    }

    const allowHeaders = req.headers['access-control-request-headers'];
    if (allowHeaders) {
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }
}

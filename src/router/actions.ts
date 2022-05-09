import { findErrorHandler, findRenderer } from './find';
import {
    TAddableData,
    TBundle,
    TConfig,
    TRendererData,
    TRouteData
} from '../types';

export async function renderRoute (collection: TAddableData, bundle: TBundle, route: TRouteData, config: TConfig): Promise<void> {
    const { routes, renderers } = collection;
    const { res } = bundle;
    const handles = route.handles;
    let payload: unknown = undefined;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    if (routes.some(route => route.method === 'OPTIONS')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    if (route.method === 'OPTIONS') {
        defaultOptions(routes, bundle, config);
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

function defaultOptions (routes: TRouteData[], bundle: TBundle, config: TConfig): void {
    const { req, res } = bundle;

    const allowMethods = getAllowMethods(routes, config);
    if (allowMethods) {
        res.setHeader('Valid', allowMethods);
        res.setHeader('Access-Control-Allow-Methods', allowMethods);
    }

    const allowHeaders = req.headers['access-control-request-headers'];
    if (allowHeaders) {
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }
}

function getAllowMethods (routes: TRouteData[], config: TConfig): string {
    const result = new Set(routes.map(route => route.method));

    if (config.autoHead && result.has('GET')) result.add('HEAD');

    return [...result].sort().join(', ');
}

import { findErrorHandler, findRenderer } from './find';
import {
    TAddableData,
    TBundle,
    TRendererData,
    TRouteData
} from '../types';

export async function renderRoute ({ renderers }: TAddableData, bundle: TBundle, route?: TRouteData): Promise<void> {
    const { res } = bundle;
    const handles = route?.handles || [];
    let payload: unknown = undefined;

    for (const handle of handles) {
        payload = await handle(bundle);

        if (res.writableEnded || payload !== undefined) {
            break;
        }
    }

    await finalize(renderers, bundle, payload);
}

export async function renderError ({ errorHandlers, renderers }: TAddableData, bundle: TBundle, error: unknown): Promise<void> {
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

export function options ({ routes }: TAddableData, bundle: TBundle): void {
    const { req, res } = bundle;

    const allowMethods = getAllowMethods(routes);
    if (allowMethods) {
        res.setHeader('Valid', allowMethods);
        res.setHeader('Access-Control-Allow-Methods', allowMethods);
    }

    const allowHeaders = req.headers['access-control-request-headers'];
    if (allowHeaders) {
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
    }
}

function getAllowMethods (routes: TRouteData[]): string {
    const result = new Set(routes.map(route => route.method));

    if (result.has('GET')) result.add('HEAD');
    if (result.size > 0) result.add('OPTIONS');

    return [...result].join(', ');
}

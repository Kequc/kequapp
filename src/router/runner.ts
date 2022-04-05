import { findErrorHandler, findRenderer } from './search';
import {
    TAddableData,
    TBundle,
    TRendererData,
    TRouteData
} from '../types';

export async function handleRoute ({ renderers }: TAddableData, bundle: TBundle, route?: TRouteData): Promise<void> {
    const handles = route?.handles || [];
    let payload: unknown = undefined;

    for (const handle of handles) {
        payload = await handle(bundle);

        if (bundle.res.writableEnded || payload !== undefined) {
            break;
        }
    }

    await finalize(renderers, bundle, payload);
}

export async function handleError ({ errorHandlers, renderers }: TAddableData, bundle: TBundle, error: unknown): Promise<void> {
    const errorHandler = findErrorHandler(errorHandlers, getContentType(bundle));
    const payload = await errorHandler(error, bundle);

    await finalize(renderers, bundle, payload);

    if (bundle.res.statusCode === 500) {
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

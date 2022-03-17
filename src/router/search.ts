import {
    TBundle,
    TErrorHandler,
    TErrorHandlerData,
    TRenderer,
    TRendererData,
    TRouteData
} from '../types';
import Ex from '../util/ex';
import { getHeader, sanitizeContentType } from '../util/sanitize';

export function findRoute (routes: TRouteData[], method: string): TRouteData | undefined {
    const route = routes.find(route => route.method === method);

    if (!route && method === 'HEAD') {
        return findRoute(routes, 'GET');
    }

    return route;
}

export function findRenderer (renderers: TRendererData[], contentType: string): TRenderer {
    const renderer = renderers.find(renderer => compareContentType(renderer.contentType, contentType));

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType,
            availalble: renderers.map(renderer => renderer.contentType)
        });
    }

    return renderer.handle;
}

export function findErrorHandler (errorHandlers: TErrorHandlerData[], contentType: string): TErrorHandler {
    const errorHandler = errorHandlers.find(errorHandler => compareContentType(errorHandler.contentType, contentType));

    if (!errorHandler) {
        throw Ex.InternalServerError('Error handler not found', {
            contentType,
            availalble: errorHandlers.map(errorHandler => errorHandler.contentType)
        });
    }

    return errorHandler.handle;
}

export function getContentType ({ res }: TBundle): string {
    return sanitizeContentType(getHeader(res, 'Content-Type'));
}

function compareContentType (a: string, b: string): boolean {
    const wildIndex = a.indexOf('*');

    if (wildIndex > -1) {
        return a.slice(0, wildIndex) === b.slice(0, wildIndex);
    }

    return a === b;
}

import { TErrorHandler, TErrorHandlerData, TRenderer, TRendererData } from '../types';
import Ex from '../built-in/tools/ex';

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

function compareContentType (a: string, b: string): boolean {
    const wildIndex = a.indexOf('*');

    if (wildIndex > -1) {
        return a.slice(0, wildIndex) === b.slice(0, wildIndex);
    }

    return a === b;
}

// export function warnDuplicates ({ logger }: TConfig, routes: TRouteData[]): void {
//     const checked: TRouteData[] = [];

//     for (const route of routes) {
//         const exists = checked.find(value => isDuplicate(value, route));
//         if (exists) {
//             logger.warn('Duplicate route detected', {
//                 method: route.method,
//                 url: `/${route.parts.join('/')}`,
//                 matches: `/${exists.parts.join('/')}`
//             });
//         }
//         checked.push(route);
//     }
// }

// export function isDuplicate (a: TRouteData, b: TRouteData): boolean {
//     if (a.method !== b.method || a.parts.length !== b.parts.length) {
//         return false;
//     }

//     const count = a.parts.length;

//     for (let i = 0; i < count; i++) {
//         const aa = a.parts[i];
//         const bb = b.parts[i];
//         if (aa === bb) continue;
//         if ((aa === '**' || aa[0] === ':') && (bb === '**' || bb[0] === ':')) return true;
//         return false;
//     }

//     return true;
// }

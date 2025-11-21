import Ex from '../built-in/tools/ex.ts';
import type { ErrorHandler, ErrorHandlerData, Renderer, RendererData } from '../types.ts';

export function findRenderer(renderers: RendererData[], contentType: string): Renderer {
    const renderer = renderers.find((renderer) =>
        compareContentType(renderer.contentType, contentType),
    );

    if (!renderer) {
        throw Ex.InternalServerError('Renderer not found', {
            contentType,
            availalble: renderers.map((renderer) => renderer.contentType),
        });
    }

    return renderer.action;
}

export function findErrorHandler(
    errorHandlers: ErrorHandlerData[],
    contentType: string,
): ErrorHandler {
    const errorHandler = errorHandlers.find((errorHandler) =>
        compareContentType(errorHandler.contentType, contentType),
    );

    if (!errorHandler) {
        throw Ex.InternalServerError('Error handler not found', {
            contentType,
            availalble: errorHandlers.map((errorHandler) => errorHandler.contentType),
        });
    }

    return errorHandler.action;
}

function compareContentType(a: string, b: string): boolean {
    const wildIndex = a.indexOf('*');

    if (wildIndex > -1) {
        return a.slice(0, wildIndex) === b.slice(0, wildIndex);
    }

    return a === b;
}

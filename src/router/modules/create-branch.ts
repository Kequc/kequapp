import {
    IAddable,
    IAddableBranch,
    TAddableData,
    TErrorHandlerData,
    THandle,
    TPathname,
    TRendererData,
    TRouteData
} from '../../types';
import { extractHandles, extractUrl, getParts } from '../../util/extract';
import {
    validateArray,
    validateExists,
    validateObject,
    validateType
} from '../../util/validate';

export interface ICreateBranch {
    (url: TPathname, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

export default createBranch as ICreateBranch;

function createBranch (...params: unknown[]): IAddableBranch {
    const parts = getParts(extractUrl(params));
    const handles = extractHandles<THandle>(params);

    // we don't want wild
    if (parts.includes('**')) parts.pop();

    const routes: TRouteData[] = [{
        parts: ['**'],
        handles: [],
        method: 'OPTIONS'
    }];
    const renderers: TRendererData[] = [];
    const errorHandlers: TErrorHandlerData[] = [];

    function branch (): TAddableData {
        return {
            routes: routes.map(route => ({
                ...route,
                parts: [...parts, ...route.parts],
                handles: [...handles, ...route.handles],
            })),
            renderers: renderers.map(renderer => ({
                ...renderer,
                parts: [...parts, ...renderer.parts],
            })),
            errorHandlers: errorHandlers.map(errorHandler => ({
                ...errorHandler,
                parts: [...parts, ...errorHandler.parts],
            }))
        };
    }

    function add (...addables: IAddable[]): IAddableBranch {
        validateArray(addables, 'Addable', 'function');

        const addablesData = addables.map(addable => addable());

        validateArray(addablesData, 'Addable return value', 'object');

        const newRoutes = addablesData.map(addableData => addableData.routes || []).flat();
        const newRenderers = addablesData.map(addableData => addableData.renderers || []).flat();
        const newErrorHandlers = addablesData.map(addableData => addableData.errorHandlers || []).flat();

        validateRoutes(newRoutes);
        validateRenderers(newRenderers);
        validateErrorHandlers(newErrorHandlers);

        routes.unshift(...newRoutes);
        renderers.unshift(...newRenderers);
        errorHandlers.unshift(...newErrorHandlers);

        return branch as IAddableBranch;
    }

    Object.assign(branch, { add });

    return branch as IAddableBranch;
}

function validateRoutes (routes: TRouteData[]): void {
    validateArray(routes, 'Routes', 'object');

    for (const route of routes || []) {
        validateExists(route, 'Route');
        validateObject(route, 'Route');

        validateExists(route.parts, 'Route parts');
        validateArray(route.parts, 'Route parts', 'string');

        validateExists(route.handles, 'Route handles');
        validateArray(route.handles, 'Route handles', 'function');

        validateExists(route.method, 'Route method');
        validateType(route.method, 'Route method', 'string');
    }
}

function validateRenderers (renderers: TRendererData[]): void {
    validateArray(renderers, 'Renderers', 'object');

    for (const renderer of renderers || []) {
        validateExists(renderer.parts, 'Renderer parts');
        validateArray(renderer.parts, 'Renderer parts', 'string');

        validateExists(renderer.contentType, 'Renderer contentType');
        validateType(renderer.contentType, 'Renderer contentType', 'string');

        validateExists(renderer.handle, 'Renderer handle');
        validateType(renderer.handle, 'Renderer handle', 'function');
    }
}

function validateErrorHandlers (errorHandlers: TErrorHandlerData[]): void {
    validateArray(errorHandlers, 'Error handler', 'object');

    for (const errorHandler of errorHandlers || []) {
        validateExists(errorHandler.parts, 'Error handler parts');
        validateArray(errorHandler.parts, 'Error handler parts', 'string');

        validateExists(errorHandler.contentType, 'Error handler contentType');
        validateType(errorHandler.contentType, 'Error handler contentType', 'string');

        validateExists(errorHandler.handle, 'Error handler handle');
        validateType(errorHandler.handle, 'Error handler handle', 'function');
    }
}

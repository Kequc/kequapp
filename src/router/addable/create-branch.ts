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
import { extractHandles, extractPathname, getParts } from '../../util/extract';
import {
    validateArray,
    validateErrorHandlers,
    validateRenderers,
    validateRoutes
} from '../../util/validate';

export interface ICreateBranch {
    (pathname: TPathname, ...handles: THandle[]): IAddableBranch;
    (...handles: THandle[]): IAddableBranch;
}

export default createBranch as ICreateBranch;

function createBranch (...params: unknown[]): IAddableBranch {
    const parts = getParts(extractPathname(params));
    const handles = extractHandles<THandle>(params);

    // we don't want wild
    if (parts.includes('**')) parts.pop();

    const routes: TRouteData[] = [];
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

        validateRoutes(newRoutes, routes);
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

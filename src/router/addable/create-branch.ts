import {
    IAddable,
    IAddableBranch,
    ICreateBranch,
    TAddableData,
    TErrorHandlerData,
    TRendererData,
    TRouteData
} from '../../types';
import { extractHandles, extractPathname, getParts } from '../../util/helpers';
import {
    validateArray,
    validateErrorHandlers,
    validateRenderers,
    validateRoutes
} from '../../util/validate';

export default createBranch as ICreateBranch;

function createBranch (...params: unknown[]): IAddableBranch {
    const parts = getParts(extractPathname(params));
    const handles = extractHandles(params);

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

        const addableDatas = addables.map(addable => addable());

        validateArray(addableDatas, 'Addable return value', 'object');

        const newRoutes = addableDatas.map(addableData => addableData.routes || []).flat();
        const newRenderers = addableDatas.map(addableData => addableData.renderers || []).flat();
        const newErrorHandlers = addableDatas.map(addableData => addableData.errorHandlers || []).flat();

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

import {
    IAddable,
    IAddableBranch,
    ICreateBranch,
    TAddableData,
    TErrorHandler,
    TRendererData,
    TRouteData
} from '../../types';
import { extractHandles, extractParts, priority } from '../../util/helpers';
import {
    validateArray,
    validateErrorHandler,
    validateRenderers,
    validateRoutes
} from '../../util/validate';

export default createBranch as ICreateBranch;

function createBranch (...params: unknown[]): IAddableBranch {
    const parts = extractParts(params);
    const handles = extractHandles(params);

    const routes: TRouteData[] = [];
    const renderers: TRendererData[] = [];
    let errorHandler: TErrorHandler | undefined;

    function branch (): TAddableData {
        return {
            routes: routes.map(route => ({
                ...route,
                parts: [...parts, ...route.parts],
                handles: [...handles, ...route.handles],
                renderers: [...route.renderers, ...renderers],
                errorHandler: route.errorHandler || errorHandler
            })).sort(priority)
        };
    }

    function add (...addables: IAddable[]): IAddableBranch {
        validateArray(addables, 'Addable', 'function');

        const addableDatas = addables.map(addable => addable()).reverse();

        validateArray(addableDatas, 'Addable return', 'object');

        const newRoutes = findRoutes(addableDatas);
        const newRenderers = findRenderers(addableDatas);
        const newErrorHandler = findErrorHandler(addableDatas);

        validateRoutes(routes, newRoutes);
        validateRenderers(newRenderers);
        validateErrorHandler(newErrorHandler);

        routes.push(...newRoutes);
        renderers.unshift(...newRenderers);
        errorHandler = newErrorHandler || errorHandler;

        return branch as IAddableBranch;
    }

    Object.assign(branch, { add });

    return branch as IAddableBranch;
}

function findRoutes (addableDatas: TAddableData[]): TRouteData[] {
    return addableDatas.map(addableData => addableData.routes || []).flat();
}

function findRenderers (addableDatas: TAddableData[]): TRendererData[] {
    return addableDatas.map(addableData => addableData.renderers || []).flat();
}

function findErrorHandler (addableDatas: TAddableData[]): TErrorHandler | undefined {
    return addableDatas.find(addableData => !!addableData.errorHandler)?.errorHandler;
}

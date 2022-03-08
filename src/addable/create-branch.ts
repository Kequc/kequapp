import { extractParts, extractHandles, priority } from '../router/helpers';
import { IAddable, IAddableBranch, ICreateBranch, TRouteData, TErrorHandler, TRendererData, TAddableData } from '../types';
import { validateErrorHandler, validateRenderers, validateRoutes } from '../util/validate';

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
            })),
        };
    }

    function add (...addables: IAddable[]): IAddableBranch {
        const addableDatas = addables.map(addable => addable()).reverse();
        const newRoutes = findRoutes(addableDatas);
        const newRenderers = findRenderers(addableDatas);
        const newErrorHandler = findErrorHandler(addableDatas);

        validateRoutes(routes, newRoutes);
        validateRenderers(newRenderers);
        validateErrorHandler(newErrorHandler);

        routes.push(...newRoutes);
        routes.sort(priority);

        errorHandler = newErrorHandler || errorHandler;
        renderers.unshift(...newRenderers);

        return branch as IAddableBranch;
    }

    Object.assign(branch, { add });

    return branch as IAddableBranch;
}

function findRoutes (addableDatas: TAddableData[]): TRouteData[] {
    return addableDatas.map(addableData => addableData.routes || []).flat();
}

function findErrorHandler (addableDatas: TAddableData[]): TErrorHandler | undefined {
    return addableDatas.find(addableData => !!addableData.errorHandler)?.errorHandler;
}

function findRenderers (addableDatas: TAddableData[]): TRendererData[] {
    return addableDatas.map(addableData => addableData.renderers || []).flat();
}

import { extractParts, extractHandles, priority, validateAdding } from '../router/helpers';
import { IAddable, IAddableBranch, ICreateBranch, TAddableData, TErrorHandler, TRendererData } from '../types';

function createBranch (...params: unknown[]): IAddableBranch {
    const parts = extractParts(params);
    const handles = extractHandles(params);
    const added: TAddableData[] = [];

    let errorHandler: TErrorHandler | undefined;
    const renderers: TRendererData[] = [];

    function branch (): TAddableData[] {
        return added.map(addable => ({
            ...addable,
            parts: [...parts, ...addable.parts],
            handles: [...handles, ...addable.handles],
            errorHandler: addable.errorHandler || errorHandler,
            renderers
        }));
    }

    function add (...addables: IAddable[]): IAddableBranch {
        const adding = addables.map(runAddable).flat().reverse();

        validateAdding(added, adding);

        added.push(...findRoutes(adding));
        added.sort(priority);

        errorHandler = findErrorHandler(adding) || errorHandler;
        renderers.unshift(...findRenderers(adding));

        return branch as IAddableBranch;
    }

    Object.assign(branch, { add });

    return branch as IAddableBranch;
}

export default createBranch as ICreateBranch;

function findRoutes (adding: TAddableData[]): TAddableData[] {
    return adding.filter(data => data.parts.length > 0);
}

function findErrorHandler (adding: TAddableData[]): TErrorHandler | undefined {
    return adding.find(data => !!data.errorHandler)?.errorHandler;
}

function findRenderers (adding: TAddableData[]): TRendererData[] {
    return adding.map(data => data.renderers).flat();
}

function runAddable (addable: IAddable): TAddableData {
    return {
        parts: [],
        handles: [],
        method: 'GET',
        renderers: [],
        ...addable()
    };
}

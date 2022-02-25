import { extractParts, extractHandles, extractMethod } from '../router/helpers';

function createRoute (...params: unknown[]): IAddable {
    const method = extractMethod(params);
    const parts = extractParts(params);
    const handles = extractHandles(params);

    function route (): Partial<TAddableData>[] {
        return [{
            parts,
            handles,
            method
        }];
    }

    return route as IAddable;
}

export default createRoute as ICreateRoute;

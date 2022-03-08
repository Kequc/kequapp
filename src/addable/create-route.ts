import { extractParts, extractHandles, extractMethod } from '../router/helpers';
import { IAddable, ICreateRoute, TAddableData } from '../types';

export default createRoute as ICreateRoute;

function createRoute (...params: unknown[]): IAddable {
    const method = extractMethod(params);
    const parts = extractParts(params);
    const handles = extractHandles(params);

    function route (): TAddableData {
        return {
            routes: [{
                parts,
                handles,
                method,
                renderers: []
            }]
        };
    }

    return route as IAddable;
}

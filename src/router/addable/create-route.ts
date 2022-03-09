import { IAddable, ICreateRoute, TAddableData } from '../../types';
import { extractHandles, extractMethod, extractParts } from '../../util/helpers';

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

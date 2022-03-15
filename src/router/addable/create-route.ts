import { IAddable, ICreateRoute, TAddableData } from '../../types';
import {
    extractHandles,
    extractMethod,
    extractPathname,
    getParts
} from '../../util/helpers';

export default createRoute as ICreateRoute;

function createRoute (...params: unknown[]): IAddable {
    const method = extractMethod(params);
    const parts = getParts(extractPathname(params));
    const handles = extractHandles(params);

    function route (): Partial<TAddableData> {
        return {
            routes: [{
                parts,
                handles,
                method
            }]
        };
    }

    return route as IAddable;
}

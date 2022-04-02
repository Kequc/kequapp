import {
    IAddable,
    TAddableData,
    THandle,
    TPathname
} from '../../types';
import {
    extractHandles,
    extractMethod,
    extractPathname,
    getParts
} from '../../util/extract';
import { validateExists } from '../../util/validate';

interface ICreateRoute {
    (method: string, pathname: TPathname, ...handles: THandle[]): IAddable;
    (pathname: TPathname, ...handles: THandle[]): IAddable;
    (method: string, ...handles: THandle[]): IAddable;
    (...handles: THandle[]): IAddable;
}

export default createRoute as ICreateRoute;

function createRoute (...params: unknown[]): IAddable {
    const method = extractMethod(params);
    const parts = getParts(extractPathname(params));
    const handles = extractHandles<THandle>(params);

    validateExists(handles[0], 'Route handle');

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

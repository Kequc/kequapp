import { extractParts, extractHandles, extractMethod } from './helpers';

function createRoute (...params: unknown[]): IRouterInstance {
    const method = extractMethod(params);
    const parts = extractParts(params);
    const handles = extractHandles(params);

    function route (): Omit<TRouteData, 'options'>[] {
        return [{
            parts,
            handles,
            method
        }];
    }

    return route as IRouterInstance;
}

export default createRoute as ICreateRoute;

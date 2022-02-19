import { extractParts, extractHandles } from './helpers';

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

function extractMethod (params: unknown[]): string {
    if (typeof params[0] !== 'string' || params[0][0] === '/') {
        return 'GET';
    }

    return params.shift() as string;
}

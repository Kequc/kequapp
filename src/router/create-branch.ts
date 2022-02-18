import { compareRoute } from '../util/path-params';
import { extractParts, extractHandles } from './helpers';

function createBranch (...params: unknown[]): IBranchInstance {
    const parts = extractParts(params);
    const handles = extractHandles(params);
    const routes: TRouteData[] = [];

    function branch (): TRouteData[] {
        return routes.map(route => ({
            ...route,
            parts: [...parts, ...route.parts],
            handles: [...handles, ...route.handles]
        }));
    }

    function add (...routers: IRouterInstance[]) {
        const newRoutes = routers.map(router => router()).flat();

        validate(newRoutes, routes);

        routes.push(...newRoutes);
        routes.sort(sorted);
    }

    Object.assign(branch, { add });

    return branch as IBranchInstance;
}

export default createBranch as ICreateBranch;

function validate (newRoutes: TRouteData[], routes: TRouteData[]): void {
    const checked = [...routes];

    for (const route of newRoutes) {
        const exists = checked.find(existing => compareRoute(existing, route.parts, route.method));

        if (exists) {
            console.error({
                method: route.method,
                pathname: '/' + route.parts.join('/'),
                matches: '/' + exists.parts.join('/')
            });

            throw new Error('Route already exists');
        }

        checked.push(route);
    }
}

function sorted (a: TRouteData, b: TRouteData) {
    return (a.parts.join('') + a.method).localeCompare(b.parts.join('') + b.method);
}

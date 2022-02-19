import { extendConfig } from '../util/config';
import { extractParts, extractHandles } from './helpers';

function createBranch (...params: unknown[]): IBranchInstance {
    const parts = extractParts(params);
    const options = extractOptions(params);
    const handles = extractHandles(params);
    const routes: TRouteData[] = [];

    function branch (): TRouteData[] {
        return routes.map(route => ({
            ...route,
            parts: [...parts, ...route.parts],
            options: extendConfig(options, route.options),
            handles: [...handles, ...route.handles]
        }));
    }

    function add (...routers: IRouterInstance[]): IBranchInstance {
        const newRoutes = routers.map(router => router()).flat();

        validate(newRoutes, routes);

        routes.push(...newRoutes);
        routes.sort(priority);

        return branch as IBranchInstance;
    }

    Object.assign(branch, { add });

    return branch as IBranchInstance;
}

export default createBranch as ICreateBranch;

function extractOptions (params: unknown[]): Partial<TConfig> {
    if (typeof params[0] !== 'object' || typeof params[0] === null) {
        return {};
    }

    return params.shift() as Partial<TConfig>;
}

function validate (newRoutes: TRouteData[], routes: TRouteData[]): void {
    const checked = [...routes];

    for (const route of newRoutes) {
        const exists = checked.find(existing => isDuplicate(existing, route));

        if (exists) {
            console.error({
                method: route.method,
                pathname: `/${route.parts.join('/')}`,
                matches: `/${exists.parts.join('/')}`
            });

            throw new Error('Route already exists');
        }

        checked.push(route);
    }
}

function isDuplicate (a: TRouteData, b: TRouteData): boolean {
    if (a.method !== b.method || a.parts.length !== b.parts.length) {
        return false;
    }

    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];
        if (aa === bb) continue;
        if ((aa === '**' || aa[0] === ':') && (bb === '**' || bb[0] === ':')) continue;
        return false;
    }

    return true;
}

function priority (a: TRouteData, b: TRouteData) {
    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];

        if (aa === bb)  continue;

        if (bb === undefined) return 1;
        if (aa === '**' || aa[0] === ':') return 1;
        if (bb === '**' || bb[0] === ':') return -1;

        return aa.localeCompare(bb);
    }

    return -1;
}

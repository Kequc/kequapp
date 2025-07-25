import Ex from '../built-in/tools/ex.ts';
import type { IRouter, TBranch, TBranchData, TRoute } from '../types.ts';
import logger from '../util/logger.ts';
import { validateBranch } from '../util/validate.ts';
import createRegexp from './create-regexp.ts';
import { cacheBranches, cacheRoutes } from './util/cacher.ts';
import { matchGroups } from './util/extract.ts';

export default function createRouter(structure: TBranchData): IRouter {
    validateBranch(structure);

    const routes = cacheRoutes(structure);
    const branches = cacheBranches(structure);

    return function router(method: string, url: string) {
        const matchedRoutes = routes.filter((item) => item.regexp.test(url));
        const route =
            getRoute(matchedRoutes, method) ??
            generate404(branches, url, method);
        const params = matchGroups(url, route.regexp);
        const methods = getMethods(matchedRoutes, route.autoHead);

        return [route, params, methods];
    };
}

function getRoute(routes: TRoute[], method: string): TRoute | undefined {
    const route = routes.find((item) => item.method === method);

    if (route === undefined && method === 'HEAD') {
        return routes.find((item) => item.autoHead && item.method === 'GET');
    }

    return route;
}

function generate404(branches: TBranch[], key: string, method: string): TRoute {
    const branch: TBranch = branches.find((item) => item.regexp.test(key)) ?? {
        regexp: createRegexp('/**'),
        actions: [],
        errorHandlers: [],
        renderers: [],
        autoHead: true,
        logger,
    };

    return {
        ...branch,
        method,
        actions: [
            ...branch.actions,
            () => {
                throw Ex.NotFound();
            },
        ],
    };
}

function getMethods(routes: TRoute[], autoHead: boolean): string[] {
    const set = new Set(routes.map((item) => item.method));

    if (autoHead && set.has('GET')) set.add('HEAD');

    return [...set];
}

import createRegex from './create-regex';
import { Ex } from '../main';
import {
    IRouter,
    TBranch,
    TBranchData,
    TRoute
} from '../types';
import logger from '../util/logger';
import { validateBranch } from '../util/validate';
import { cacheBranches, cacheRoutes } from './util/cacher';

// TODO:
// create tests for new files

export default function createRouter (structure: TBranchData): IRouter {
    validateBranch(structure);

    const routes = cacheRoutes(structure);
    const branches = cacheBranches(structure);

    return function router (method: string, url: string) {
        const matchedRoutes = routes.filter(item => item.regex.test(url));
        const route = getRoute(matchedRoutes, method) ?? generate404(branches, url, method);
        const params = url.match(route.regex)?.groups ?? {};
        const methods = getMethods(matchedRoutes, route.autoHead);

        return [route, params, methods];
    };
}

function getRoute (routes: TRoute[], method: string): TRoute | undefined {
    const route = routes.find(item => item.method === method);

    if (route === undefined && method === 'HEAD') {
        const altRoute = routes.find(item => item.method === 'GET');
        if (altRoute?.autoHead) return altRoute;
    }

    return route;
}

function generate404 (branches: TBranch[], key: string, method: string): TRoute {
    const branch: TBranch = branches.find(item => item.regex.test(key)) ?? {
        regex: createRegex('/**'),
        handles: [],
        errorHandlers: [],
        renderers: [],
        autoHead: true,
        logger
    };

    return {
        ...branch,
        method,
        handles: [...branch.handles, () => { throw Ex.NotFound(); }]
    };
}

function getMethods (routes: TRoute[], autoHead: boolean): string[] {
    const set = new Set(routes.map(item => item.method));

    if (autoHead && set.has('GET')) set.add('HEAD');

    return [...set];
}

import createRegex from './create-regex';
import {
    IRouter,
    TBranch,
    TBranchData,
    TCacheBranch,
    TCacheRoute,
    TRoute,
    TRouteData
} from '../types';
import errorHandler from '../built-in/error-handler';
import jsonRenderer from '../built-in/json-renderer';
import textRenderer from '../built-in/text-renderer';
import { Ex } from '../main';
import { getParts } from '../util/extract';
import { priorityContentType, priorityParts } from '../util/priority';
import { validateBranch } from '../util/validate';
import warnDuplicates from '../util/warn-duplicates';

// TODO:
// create tests for new files

export default function createRouter (structure: TBranchData): IRouter {
    validateBranch(structure);

    const cachedRoutes: TRoute[] = cacheRoutes(structure).map(item => ({
        ...sanitize(item),
        method: item.method
    })).sort(priorityParts);
    const cachedBranches: TBranch[] = cacheBranches(structure).map(sanitize);

    warnDuplicates(cachedRoutes, structure.logger ?? console);

    return function router (method: string, clientParts: string[]) {
        const key = '/' + clientParts.join('/');
        const routes = cachedRoutes.filter(item => item.regex.test(key));
        const route = getRoute(routes, method) ?? generate404(cachedBranches, key, method);
        const methods = getMethods(routes, route.autoHead);
        return [route, methods];
    };
}

function cacheRoutes (target: TBranchData): TCacheRoute[] {
    const result: TCacheRoute[] = [];
    const targetParts = getParts(target.url);

    for (const route of target.routes ?? []) {
        result.push({
            ...extendRoute(target, route),
            method: route.method,
            parts: [...targetParts, ...getParts(route.url)]
        });
    }

    for (const branch of target.branches ?? []) {
        for (const source of cacheRoutes(branch)) {
            result.push({
                ...extendBranch(target, source),
                method: source.method,
                parts: [...targetParts, ...source.parts]
            });
        }
    }

    return result;
}

function cacheBranches (target: TBranchData): TCacheBranch[] {
    const result: TCacheBranch[] = [];
    const targetParts = getParts(target.url);

    for (const branch of target.branches ?? []) {
        for (const source of cacheBranches(branch)) {
            result.push({
                ...extendBranch(target, source),
                parts: [...targetParts, ...source.parts]
            });
        }
    }

    return result;
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
        parts: ['**'],
        regex: createRegex(['**']),
        handles: [],
        errorHandlers: [],
        renderers: [],
        autoHead: true,
        logger: console
    };

    return {
        ...branch,
        method,
        handles: [...branch.handles, () => { throw Ex.NotFound(); }]
    };
}

function sanitize (item: TCacheBranch): TBranch {
    return {
        parts: item.parts,
        handles: item.handles,
        regex: createRegex(item.parts),
        errorHandlers: [...item.errorHandlers.sort(priorityContentType), errorHandler],
        renderers: [...item.renderers.sort(priorityContentType), jsonRenderer, textRenderer],
        autoHead: item.autoHead ?? true,
        logger: item.logger ?? console
    };
}

function extendBranch (target: TBranchData, source: TCacheBranch) {
    return {
        handles: [...target.handles ?? [], ...source.handles],
        errorHandlers: [...source.errorHandlers, ...target.errorHandlers ?? []],
        renderers: [...source.renderers, ...target.renderers ?? []],
        autoHead: source.autoHead ?? target.autoHead,
        logger: source.logger
    };
}

function extendRoute (target: TBranchData, route: TRouteData) {
    return {
        handles: [...target.handles ?? [], ...route.handles ?? []],
        errorHandlers: [...target.errorHandlers ?? []],
        renderers: [...target.renderers ?? []],
        autoHead: route.autoHead,
        logger: route.logger
    };
}

function getMethods (routes: TRoute[], autoHead: boolean): string[] {
    const set = new Set(routes.map(item => item.method));
    if (autoHead && set.has('GET')) set.add('HEAD');
    return [...set];
}

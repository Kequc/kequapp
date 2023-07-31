import path from 'path';
import createRegexp from '../create-regexp';
import warnDuplicates from './warn-duplicates';
import errorHandler from '../../built-in/error-handler';
import jsonRenderer from '../../built-in/json-renderer';
import textRenderer from '../../built-in/text-renderer';
import {
    TBranch,
    TBranchData,
    TCacheBranch,
    TCacheRoute,
    TPathname,
    TRoute,
    TRouteData
} from '../../types';
import logger, { extendLogger } from '../../util/logger';
import { priorityContentType, priorityUrl } from './priority';

export function cacheRoutes (structure: TBranchData): TRoute[] {
    const routes = cacheRoutesMeta(structure);

    warnDuplicates(routes, structure.logger?.warn ?? logger.warn);

    return routes.sort(priorityUrl).map(item => ({
        ...sanitize(item),
        method: item.method
    }));
}

function cacheRoutesMeta (target: TBranchData): TCacheRoute[] {
    const routes: TCacheRoute[] = [];

    for (const route of target.routes ?? []) {
        routes.push({
            ...extendRoute(target, route),
            method: route.method,
            url: extendUrl(target.url, route.url)
        });
    }

    for (const branch of target.branches ?? []) {
        for (const source of cacheRoutesMeta(branch)) {
            routes.push({
                ...extendBranch(target, source),
                method: source.method,
                url: extendUrl(target.url, source.url)
            });
        }
    }

    return routes;
}

export function cacheBranches (structure: TBranchData): TBranch[] {
    return cacheBranchesMeta(structure).map(sanitize);
}

function cacheBranchesMeta (target: TBranchData): TCacheBranch[] {
    const branches: TCacheBranch[] = [];

    for (const branch of target.branches ?? []) {
        for (const source of cacheBranchesMeta(branch)) {
            branches.push({
                ...extendBranch(target, source),
                url: extendUrl(target.url, source.url)
            });
        }
    }

    return branches;
}

function sanitize (item: TCacheBranch): TBranch {
    return {
        handles: item.handles,
        regexp: createRegexp(item.url),
        errorHandlers: [...item.errorHandlers.sort(priorityContentType), errorHandler],
        renderers: [...item.renderers.sort(priorityContentType), jsonRenderer, textRenderer],
        autoHead: item.autoHead ?? true,
        logger: extendLogger(logger, item.logger)
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

function extendUrl (target: TPathname = '/', source: TPathname = '/'): TPathname {
    return path.join('/', target, source) as TPathname;
}

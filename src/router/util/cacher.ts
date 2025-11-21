import path from 'node:path';
import errorHandler from '../../built-in/error-handler.ts';
import jsonRenderer from '../../built-in/json-renderer.ts';
import textRenderer from '../../built-in/text-renderer.ts';
import type {
    Branch,
    BranchData,
    CacheBranch,
    CacheRoute,
    Pathname,
    Route,
    RouteData,
} from '../../types.ts';
import logger, { extendLogger } from '../../util/logger.ts';
import createRegexp from '../create-regexp.ts';
import { priorityContentType, priorityUrl } from './priority.ts';
import warnDuplicates from './warn-duplicates.ts';

export function cacheRoutes(structure: BranchData): Route[] {
    const routes = cacheRoutesMeta(structure);

    warnDuplicates(routes, structure.logger?.warn ?? logger.warn);

    return routes.sort(priorityUrl).map((item) => ({
        ...sanitize(item),
        method: item.method,
    }));
}

function cacheRoutesMeta(target: BranchData): CacheRoute[] {
    const routes: CacheRoute[] = [];

    for (const route of target.routes ?? []) {
        routes.push({
            ...extendRoute(target, route),
            method: route.method,
            url: extendUrl(target.url, route.url),
        });
    }

    for (const branch of target.branches ?? []) {
        for (const source of cacheRoutesMeta(branch)) {
            routes.push({
                ...extendBranch(target, source),
                method: source.method,
                url: extendUrl(target.url, source.url),
            });
        }
    }

    return routes;
}

export function cacheBranches(structure: BranchData): Branch[] {
    const branches = cacheBranchesMeta(structure);

    branches.push({
        actions: [...(structure.actions ?? [])],
        errorHandlers: [...(structure.errorHandlers ?? [])],
        renderers: [...(structure.renderers ?? [])],
        autoHead: structure.autoHead,
        logger: { ...structure.logger },
        url: '/**',
    });

    return branches.map(sanitize);
}

function cacheBranchesMeta(target: BranchData): CacheBranch[] {
    const branches: CacheBranch[] = [];

    for (const branch of target.branches ?? []) {
        for (const source of cacheBranchesMeta(branch)) {
            branches.push({
                ...extendBranch(target, source),
                url: extendUrl(target.url, source.url),
            });
        }
    }

    return branches;
}

function sanitize(item: CacheBranch): Branch {
    return {
        actions: item.actions,
        regexp: createRegexp(item.url),
        errorHandlers: [...item.errorHandlers.sort(priorityContentType), errorHandler],
        renderers: [...item.renderers.sort(priorityContentType), jsonRenderer, textRenderer],
        autoHead: item.autoHead ?? true,
        logger: extendLogger(logger, item.logger),
    };
}

function extendBranch(target: BranchData, source: CacheBranch) {
    return {
        actions: [...(target.actions ?? []), ...source.actions],
        errorHandlers: [...source.errorHandlers, ...(target.errorHandlers ?? [])],
        renderers: [...source.renderers, ...(target.renderers ?? [])],
        autoHead: source.autoHead ?? target.autoHead,
        logger: source.logger ?? target.logger,
    };
}

function extendRoute(target: BranchData, route: RouteData) {
    return {
        actions: [...(target.actions ?? []), ...(route.actions ?? [])],
        errorHandlers: [...(target.errorHandlers ?? [])],
        renderers: [...(target.renderers ?? [])],
        autoHead: route.autoHead ?? target.autoHead,
        logger: route.logger ?? target.logger,
    };
}

function extendUrl(target: Pathname = '/', source: Pathname = '/'): Pathname {
    return path.join('/', target, source) as Pathname;
}

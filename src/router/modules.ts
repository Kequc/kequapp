import type {
    TAction,
    TBranchData,
    TErrorHandlerData,
    TRendererData,
    TRouteData,
} from '../types.ts';
import {
    validateBranch,
    validateErrorHandler,
    validateExists,
    validateRenderer,
    validateRoute,
    validateType,
} from '../util/validate.ts';

export function createAction(action: TAction): TAction {
    validateExists(action, 'Action');
    validateType(action, 'Action', 'function');
    return action;
}

export function createRoute(data: TRouteData): TRouteData {
    validateRoute(data);
    return data;
}

export function createBranch(branch: TBranchData): TBranchData {
    validateBranch(branch);
    return branch;
}

export function createErrorHandler(
    errorHandler: TErrorHandlerData,
): TErrorHandlerData {
    validateErrorHandler(errorHandler);
    return errorHandler;
}

export function createRenderer(renderer: TRendererData): TRendererData {
    validateRenderer(renderer);
    return renderer;
}

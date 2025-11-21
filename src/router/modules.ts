import type {
    Action,
    BranchData,
    ErrorHandlerData,
    RendererData,
    RouteData,
} from '../types.ts';
import {
    validateBranch,
    validateErrorHandler,
    validateExists,
    validateRenderer,
    validateRoute,
    validateType,
} from '../util/validate.ts';

export function createAction(action: Action): Action {
    validateExists(action, 'Action');
    validateType(action, 'Action', 'function');
    return action;
}

export function createRoute(data: RouteData): RouteData {
    validateRoute(data);
    return data;
}

export function createBranch(branch: BranchData): BranchData {
    validateBranch(branch);
    return branch;
}

export function createErrorHandler(
    errorHandler: ErrorHandlerData,
): ErrorHandlerData {
    validateErrorHandler(errorHandler);
    return errorHandler;
}

export function createRenderer(renderer: RendererData): RendererData {
    validateRenderer(renderer);
    return renderer;
}

import {
    TBranchData,
    TErrorHandlerData,
    THandle,
    TRendererData,
    TRouteData
} from '../types';
import {
    validateBranch,
    validateErrorHandler,
    validateExists,
    validateRenderer,
    validateRoute,
    validateType
} from '../util/validate';

export function createHandle (handle: THandle): THandle {
    validateExists(handle, 'Handle');
    validateType(handle, 'Handle', 'function');
    return handle;
}

export function createRoute (data: TRouteData): TRouteData {
    validateRoute(data);
    return data;
}

export function createBranch (branch: TBranchData): TBranchData {
    validateBranch(branch);
    return branch;
}

export function createErrorHandler (errorHandler: TErrorHandlerData): TErrorHandlerData {
    validateErrorHandler(errorHandler);
    return errorHandler;
}

export function createRenderer (renderer: TRendererData): TRendererData {
    validateRenderer(renderer);
    return renderer;
}

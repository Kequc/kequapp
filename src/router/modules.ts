import type { IncomingMessage, RequestListener, ServerResponse } from 'node:http';
import type { Action, BranchData, ErrorHandlerData, RendererData, RouteData } from '../types.ts';
import {
    validateBranch,
    validateErrorHandler,
    validateExists,
    validateRenderer,
    validateRoute,
    validateType,
} from '../util/validate.ts';
import { createRouter } from './create-router.ts';
import { requestProcessor } from './request-processor.ts';

export function createApp(structure: BranchData): RequestListener {
    const router = createRouter(structure);
    return function app(req: IncomingMessage, res: ServerResponse): void {
        requestProcessor(router, req, res);
    };
}

export function createBranch(branch: BranchData): BranchData {
    validateBranch(branch);
    return branch;
}

export function createRoute(data: RouteData): RouteData {
    validateRoute(data);
    return data;
}

export function createAction(action: Action): Action {
    validateExists(action, 'Action');
    validateType(action, 'Action', 'function');
    return action;
}

export function createErrorHandler(errorHandler: ErrorHandlerData): ErrorHandlerData {
    validateErrorHandler(errorHandler);
    return errorHandler;
}

export function createRenderer(renderer: RendererData): RendererData {
    validateRenderer(renderer);
    return renderer;
}

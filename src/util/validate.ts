import { TBranchData, TErrorHandlerData, TRendererData, TRouteData } from '../router/types';
import { TLogger } from '../types';

export function validateObject (topic: unknown, name: string, type?: string): void {
    if (topic !== undefined) {
        if (typeof topic !== 'object' || topic === null || Array.isArray(topic)) {
            throw new Error(`${name} must be an object`);
        }

        if (type !== undefined) {
            for (const key of Object.keys(topic)) {
                validateType((topic as { [k: string]: unknown })[key], `${name} ${key}`, type);
            }
        }
    }
}

export function validateArray (topic: unknown, name: string, type?: string): void {
    if (topic !== undefined) {
        if (!Array.isArray(topic)) {
            throw new Error(`${name} must be an array`);
        }

        if (type !== undefined) {
            for (const value of topic) {
                validateType(value, `${name} item`, type);
            }
        }
    }
}

export function validateType (topic: unknown, name: string, type: string): void {
    if (topic !== undefined) {
        if (type === 'object') {
            validateObject(topic, name);
        } else if (typeof topic !== type) {
            throw new Error(`${name} must be a ${type}`);
        }
    }
}

const PATHNAME_REGEX = /^(?:\/:[^/: *]+|\/[^/: *]*|\/\*{2})+$/;

export function validatePathname (topic: unknown, name: string, isWild = false): void {
    if (topic !== undefined) {
        validateType(topic, name, 'string');

        if ((topic as string)[0] !== '/') {
            throw new Error(`${name} must start with '/'`);
        }
        if (isWild && !(topic as string).endsWith('/**')) {
            throw new Error(`${name} must end with '/**'`);
        }
        if (!(topic as string).match(PATHNAME_REGEX)) {
            throw new Error(`${name} invalid format '${topic}'`);
        }
    }
}

export function validateExists (topic: unknown, name: string): void {
    if (topic === undefined) {
        throw new Error(`${name} is undefined`);
    }
}

export function validateBranch (branch: TBranchData): void {
    validateExists(branch, 'Branch');
    validateObject(branch, 'Branch');
    validatePathname(branch.url, 'Branch url');
    validateArray(branch.handles, 'Branch handles', 'function');
    validateArray(branch.branches, 'Branch handles');
    validateArray(branch.routes, 'Branch routes');
    validateArray(branch.errorHandlers, 'Branch errorHandlers');
    validateArray(branch.renderers, 'Branch renderers');
    validateLogger(branch.logger);
    validateType(branch.autoHead, 'Branch autoHead', 'boolean');
}

export function validateRoute (route: TRouteData): void {
    validateExists(route, 'Route');
    validateObject(route, 'Route');
    validateExists(route.method, 'Route method');
    validateType(route.method, 'Route method', 'string');
    validateExists(route.url, 'Route url');
    validatePathname(route.url, 'Route url');
    validateArray(route.handles, 'Route handles', 'function');
    validateLogger(route.logger);
    validateType(route.autoHead, 'Route autoHead', 'boolean');
}

export function validateErrorHandler (errorHandler: TErrorHandlerData): void {
    validateExists(errorHandler, 'Error handler');
    validateObject(errorHandler, 'Error handler');
    validateExists(errorHandler.contentType, 'Error handler contentType');
    validateType(errorHandler.contentType, 'Error handler contentType', 'string');
    validatePathname(errorHandler.url, 'Error handler url');
    validateExists(errorHandler.handle, 'Error handler handle');
    validateType(errorHandler.handle, 'Error handler handle', 'function');
}

export function validateRenderer (renderer: TRendererData): void {
    validateExists(renderer, 'Renderer');
    validateObject(renderer, 'Renderer');
    validateExists(renderer.contentType, 'Renderer contentType');
    validateType(renderer.contentType, 'Renderer contentType', 'string');
    validatePathname(renderer.url, 'Renderer url');
    validateExists(renderer.handle, 'Renderer handle');
    validateType(renderer.handle, 'Renderer handle', 'function');
}

export function validateLogger (logger?: TLogger): void {
    validateObject(logger, 'Logger', 'function');
    if (!logger) return;
    validateExists(logger.debug, 'Logger debug');
    validateExists(logger.log, 'Logger log');
    validateExists(logger.warn, 'Logger warn');
    validateExists(logger.error, 'Logger error');
}

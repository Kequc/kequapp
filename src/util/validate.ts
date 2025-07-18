import { getParts } from '../router/util/extract.ts';
import type {
    TBranchData,
    TErrorHandlerData,
    TLogger,
    TRendererData,
    TRouteData,
} from '../types.ts';

export const PATHNAME_REGEX = /^(?:\/:[a-zA-Z_]\w*|\/[^/*:\\? ]*|\/\*{2})+$/;
export const CONTENT_TYPE_REGEX = /^[a-zA-Z]+\/(?:[a-zA-Z]+|\*)|\*$/;

export function validateObject(
    topic: unknown,
    name: string,
    type?: string,
): void {
    if (topic !== undefined) {
        if (
            typeof topic !== 'object' ||
            topic === null ||
            Array.isArray(topic)
        ) {
            throw new Error(`${name} must be an object`);
        }

        if (type !== undefined) {
            for (const key of Object.keys(topic)) {
                validateType(
                    (topic as { [k: string]: unknown })[key],
                    `${name} ${key}`,
                    type,
                );
            }
        }
    }
}

export function validateArray(
    topic: unknown,
    name: string,
    type?: string,
): void {
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

export function validateType(topic: unknown, name: string, type: string): void {
    if (topic !== undefined) {
        if (type === 'object') {
            validateObject(topic, name);
        } else if (typeof topic !== type) {
            throw new Error(`${name} must be a ${type}`);
        }
    }
}

export function validatePathname(
    topic: unknown,
    name: string,
    isWild = false,
): void {
    if (topic !== undefined) {
        validateType(topic, name, 'string');

        if ((topic as string)[0] !== '/') {
            throw new Error(`${name} must start with '/'`);
        }
        if (isWild && !(topic as string).endsWith('/**')) {
            throw new Error(`${name} must end with '/**'`);
        }
        if (!PATHNAME_REGEX.test(topic as string)) {
            throw new Error(`${name} invalid format '${topic}'`);
        }

        const existing: string[] = [];

        for (const part of getParts(topic as string)) {
            if (!part.startsWith(':')) continue;
            if (part === ':wild') {
                throw new Error(`${name} cannot contain :wild '${topic}'`);
            }
            if (existing.includes(part)) {
                throw new Error(`${name} duplicate ${part} '${topic}'`);
            }
            existing.push(part);
        }
    }
}

export function validateContentType(topic: unknown, name: string): void {
    if (topic !== undefined) {
        validateType(topic, name, 'string');

        if (!CONTENT_TYPE_REGEX.test(topic as string)) {
            throw new Error(`${name} invalid format '${topic}'`);
        }
    }
}

export function validateExists(topic: unknown, name: string): void {
    if (topic === undefined) {
        throw new Error(`${name} is undefined`);
    }
}

export function validateBranch(branch: TBranchData): void {
    validateExists(branch, 'Branch');
    validateObject(branch, 'Branch');
    validatePathname(branch.url, 'Branch url');
    validateArray(branch.actions, 'Branch actions', 'function');
    validateArray(branch.branches, 'Branch actions');
    validateArray(branch.routes, 'Branch routes');
    validateArray(branch.errorHandlers, 'Branch errorHandlers');
    validateArray(branch.renderers, 'Branch renderers');
    validateLogger(branch.logger);
    validateType(branch.autoHead, 'Branch autoHead', 'boolean');
}

export function validateRoute(route: TRouteData): void {
    validateExists(route, 'Route');
    validateObject(route, 'Route');
    validateExists(route.method, 'Route method');
    validateType(route.method, 'Route method', 'string');
    validatePathname(route.url, 'Route url');
    validateArray(route.actions, 'Route actions', 'function');
    validateLogger(route.logger);
    validateType(route.autoHead, 'Route autoHead', 'boolean');
}

export function validateErrorHandler(errorHandler: TErrorHandlerData): void {
    validateExists(errorHandler, 'Error handler');
    validateObject(errorHandler, 'Error handler');
    validateExists(errorHandler.contentType, 'Error handler contentType');
    validateContentType(errorHandler.contentType, 'Error handler contentType');
    validateExists(errorHandler.action, 'Error handler action');
    validateType(errorHandler.action, 'Error handler action', 'function');
}

export function validateRenderer(renderer: TRendererData): void {
    validateExists(renderer, 'Renderer');
    validateObject(renderer, 'Renderer');
    validateExists(renderer.contentType, 'Renderer contentType');
    validateContentType(renderer.contentType, 'Renderer contentType');
    validateExists(renderer.action, 'Renderer action');
    validateType(renderer.action, 'Renderer action', 'function');
}

export function validateLogger(logger?: Partial<TLogger>): void {
    validateObject(logger, 'Logger');

    if (logger !== undefined) {
        validateType(logger.error, 'Logger error', 'function');
        validateType(logger.warn, 'Logger warn', 'function');
        validateType(logger.info, 'Logger info', 'function');
        validateType(logger.http, 'Logger http', 'function');
        validateType(logger.verbose, 'Logger verbose', 'function');
        validateType(logger.debug, 'Logger debug', 'function');
        validateType(logger.silly, 'Logger silly', 'function');
        validateType(logger.log, 'Logger log', 'function');
    }
}

import { TErrorHandler, TErrorHandlerData, TRendererData, TRouteData } from '../types';

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
    if (type === 'object') {
        validateObject(topic, name);
    } else if (topic !== undefined && typeof topic !== type) {
        throw new Error(`${name} must be a ${type}`);
    }
}

export function validatePathname (topic: unknown, name: string, isWild = false): void {
    if (topic !== undefined) {
        validateType(topic, name, 'string');

        if ((topic as string)[0] !== '/') {
            throw new Error(`${name} must start with '/'`);
        }
        if (isWild && !(topic as string).endsWith('/**')) {
            throw new Error(`${name} must end with '/**'`);
        }
    }
}

export function validateExists (topic: unknown, name: string): void {
    if (topic === undefined) {
        throw new Error(`${name} is undefined`);
    }
}

export function validateRoutes (routes: TRouteData[], existing: TRouteData[]): void {
    const checked: TRouteData[] = [...existing];

    validateArray(routes, 'Routes', 'object');

    for (const route of routes || []) {
        validateExists(route, 'Route');
        validateObject(route, 'Route');

        validateExists(route.parts, 'Route parts');
        validateArray(route.parts, 'Route parts', 'string');

        validateExists(route.handles, 'Route handles');
        validateArray(route.handles, 'Route handles', 'function');

        validateExists(route.method, 'Route method');
        validateType(route.method, 'Route method', 'string');

        const exists = checked.find(value => isDuplicate(value, route));

        if (exists) {
            console.error('Route already exists', {
                method: route.method,
                pathname: `/${route.parts.join('/')}`,
                matches: `/${exists.parts.join('/')}`
            });

            throw new Error('Route already exists');
        }

        checked.push(route);
    }
}

export function validateRenderers (renderers: TRendererData[]): void {
    validateArray(renderers, 'Renderers', 'object');

    for (const renderer of renderers || []) {
        validateExists(renderer.parts, 'Renderer parts');
        validateArray(renderer.parts, 'Renderer parts', 'string');

        validateExists(renderer.mime, 'Renderer mime');
        validateType(renderer.mime, 'Renderer mime', 'string');

        validateExists(renderer.handle, 'Renderer handle');
        validateType(renderer.handle, 'Renderer handle', 'function');
    }
}

export function validateErrorHandlers (errorHandlers: TErrorHandlerData[]): void {
    validateArray(errorHandlers, 'Error handler', 'object');

    for (const errorHandler of errorHandlers || []) {
        validateExists(errorHandler.parts, 'Error handler parts');
        validateArray(errorHandler.parts, 'Error handler parts', 'string');

        validateExists(errorHandler.handle, 'Error handler handle');
        validateType(errorHandler.handle, 'Error handler handle', 'function');
    }
}

function isDuplicate (a: TRouteData, b: TRouteData): boolean {
    if (a.method !== b.method || a.parts.length !== b.parts.length) {
        return false;
    }

    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];
        if (aa === bb) continue;
        if ((aa === '**' || aa[0] === ':') && (bb === '**' || bb[0] === ':')) continue;
        return false;
    }

    return true;
}

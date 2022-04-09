import assert from 'assert';
import 'kequtest';
import {
    findErrorHandler,
    findRenderer,
    findRoute,
    isDuplicate
} from '../../src/router/find';
import { TErrorHandlerData, TRendererData, TRouteData } from '../../src/types';

describe('findroute', () => {
    function buildRoute (method: string): TRouteData {
        return { parts: [], handles: [], method };
    }

    it('returns a route', () => {
        const routes = [
            buildRoute('HEAD'),
            buildRoute('GET')
        ];
        assert.strictEqual(findRoute(routes, 'GET'), routes[1]);
    });

    it('returns undefined when no route', () => {
        const routes = [
            buildRoute('POST'),
            buildRoute('DELETE')
        ];
        assert.strictEqual(findRoute(routes, 'HEAD'), undefined);
    });

    it('returns available GET route when no HEAD', () => {
        const routes = [
            buildRoute('POST'),
            buildRoute('GET')
        ];
        assert.strictEqual(findRoute(routes, 'HEAD'), routes[1]);
    });

    it('returns HEAD route when available', () => {
        const routes = [
            buildRoute('POST'),
            buildRoute('GET'),
            buildRoute('HEAD')
        ];
        assert.strictEqual(findRoute(routes, 'HEAD'), routes[2]);
    });
});

describe('findRenderer', () => {
    function buildRenderer (contentType: string): TRendererData {
        return { parts: [], handle: () => {}, contentType };
    }

    it('returns a renderer', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/plain')
        ];
        assert.strictEqual(findRenderer(renderers, 'text/plain'), renderers[1].handle);
    });

    it('throws error when no renderer', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/plain')
        ];
        assert.throws(() => findRenderer(renderers, 'text/html'), {
            message: 'Renderer not found'
        });
    });

    it('returns a renderer with wildcard', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/*')
        ];
        assert.strictEqual(findRenderer(renderers, 'text/plain'), renderers[1].handle);
        assert.strictEqual(findRenderer(renderers, 'text/html'), renderers[1].handle);
    });

    it('prefers accurate content type', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/html'),
            buildRenderer('text/*')
        ];
        assert.strictEqual(findRenderer(renderers, 'text/plain'), renderers[2].handle);
        assert.strictEqual(findRenderer(renderers, 'text/html'), renderers[1].handle);
    });

    it('returns full wildcard renderer', () => {
        const renderers = [
            buildRenderer('application/json'),
            buildRenderer('text/html'),
            buildRenderer('*')
        ];
        assert.strictEqual(findRenderer(renderers, 'text/plain'), renderers[2].handle);
        assert.strictEqual(findRenderer(renderers, 'text/html'), renderers[1].handle);
    });
});

describe('findErrorHandler', () => {
    function buildErrorHandler (contentType: string): TErrorHandlerData {
        return { parts: [], handle: () => {}, contentType };
    }

    it('returns a errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/plain')
        ];
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[1].handle);
    });

    it('throws error when no errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/plain')
        ];
        assert.throws(() => findErrorHandler(errorHandlers, 'text/html'), {
            message: 'Error handler not found'
        });
    });

    it('returns a errorHandler with wildcard', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/*')
        ];
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[1].handle);
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].handle);
    });

    it('prefers accurate content type', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/html'),
            buildErrorHandler('text/*')
        ];
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[2].handle);
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].handle);
    });

    it('returns full wildcard errorHandler', () => {
        const errorHandlers = [
            buildErrorHandler('application/json'),
            buildErrorHandler('text/html'),
            buildErrorHandler('*')
        ];
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/plain'), errorHandlers[2].handle);
        assert.strictEqual(findErrorHandler(errorHandlers, 'text/html'), errorHandlers[1].handle);
    });
});

describe('isDuplicate', () => {
    function route (method: string, parts: string[]): TRouteData {
        return { method, parts, handles: [] };
    }

    function findDuplicates (routes: TRouteData[]) {
        const checked: TRouteData[] = [];
        const result: TRouteData[] = [];

        for (const route of routes) {
            const exists = checked.find(value => isDuplicate(value, route));
            if (exists) {
                result.push(route, exists);
            }
            checked.push(route);
        }

        return result;
    }

    it('does nothing when no duplicates', () => {
        const duplicates = findDuplicates([
            route('GET', ['free', 'stuff']),
            route('GET', []),
            route('GET', ['cats', '**']),
            route('GET', ['cats', 'tiffany']),
            route('GET', ['other', ':userId'])
        ]);

        assert.strictEqual(duplicates.length, 0);
    });

    it('finds duplicates', () => {
        const duplicates = findDuplicates([
            route('GET', ['free', 'stuff']),
            route('GET', []),
            route('GET', ['cats', '**']),
            route('GET', ['cats', 'tiffany']),
            route('GET', ['cats', ':userId']),
            route('GET', ['cats', 'tiffany', ':userId']),
            route('GET', ['cats', 'tiffany', ':carId']),
            route('GET', ['free', 'stuff'])
        ]);

        assert.deepStrictEqual(duplicates, [
            route('GET', ['cats', ':userId']),
            route('GET', ['cats', '**']),
            route('GET', ['cats', 'tiffany', ':carId']),
            route('GET', ['cats', 'tiffany', ':userId']),
            route('GET', ['free', 'stuff']),
            route('GET', ['free', 'stuff'])
        ]);
    });
});

import 'kequtest';
import assert from 'assert';
import createRouter from '../../src/router/create-router';
import { TErrorHandlerData, TRendererData, TRouteData } from '../../src/types';

const handle = () => {};

function route (method: string, parts: string[]): TRouteData {
    return { method, parts, handles: [] };
}

function renderer (parts: string[], contentType = '*'): TRendererData {
    return { contentType, parts, handle };
}

function errorHandler (parts: string[], contentType = '*'): TErrorHandlerData {
    return { contentType, parts, handle };
}

const router = createRouter({
    routes: [
        route('GET', ['free', 'stuff']),
        route('GET', []),
        route('GET', ['cats', '**']),
        route('GET', ['cats', 'tiffany']),
        route('POST', ['cats', 'tiffany', 'friends', '**']),
        route('GET', ['halloween']),
        route('GET', ['cats']),
        route('GET', ['**']),
        route('POST', ['cats'])
    ],
    renderers: [
        renderer(['**']),
        renderer(['halloween', '**'], 'text/html'),
        renderer(['halloween', '**'], 'application/*'),
        renderer(['cats', '**']),
        renderer(['cats', 'tiffany', 'friends']),
        renderer(['halloween', '**'], 'text/plain'),
        renderer(['halloween', '**'], 'application/json'),
        renderer(['halloween', '**'])
    ],
    errorHandlers: []
});

describe('priority', () => {
    it('sorts routes', () => {
        assert.deepStrictEqual(router().routes, [
            route('GET', []),
            route('GET', ['cats']),
            route('POST', ['cats']),
            route('GET', ['cats', 'tiffany']),
            route('POST', ['cats', 'tiffany', 'friends', '**']),
            route('GET', ['cats', '**']),
            route('GET', ['free', 'stuff']),
            route('GET', ['halloween']),
            route('GET', ['**'])
        ]);
    });

    it('sorts renderers', () => {
        assert.deepStrictEqual(router().renderers, [
            renderer(['cats', 'tiffany', 'friends']),
            renderer(['cats', '**']),
            renderer(['halloween', '**'], 'text/html'),
            renderer(['halloween', '**'], 'text/plain'),
            renderer(['halloween', '**'], 'application/json'),
            renderer(['halloween', '**'], 'application/*'),
            renderer(['halloween', '**']),
            renderer(['**']),
        ]);
    });
});

describe('compare', () => {
    it('filters routes', () => {
        assert.deepStrictEqual(router('/cats').routes, [
            route('GET', ['cats']),
            route('POST', ['cats']),
            route('GET', ['cats', '**']),
            route('GET', ['**'])
        ]);
    });

    it('filters nested routes', () => {
        assert.deepStrictEqual(router('/cats/tiffany').routes, [
            route('GET', ['cats', 'tiffany']),
            route('GET', ['cats', '**']),
            route('GET', ['**'])
        ]);
    });

    it('finds wildcard routes', () => {
        assert.deepStrictEqual(router('/cats/rodger').routes, [
            route('GET', ['cats', '**']),
            route('GET', ['**'])
        ]);
    });
});

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
    errorHandlers: [
        errorHandler(['**']),
        errorHandler(['halloween', '**'], 'text/html'),
        errorHandler(['halloween', '**'], 'application/*'),
        errorHandler(['cats', '**']),
        errorHandler(['cats', 'tiffany', 'friends']),
        errorHandler(['halloween', '**'], 'text/plain'),
        errorHandler(['halloween', '**'], 'application/json'),
        errorHandler(['halloween', '**'])
    ]
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

    it('sorts errorHandlers', () => {
        assert.deepStrictEqual(router().errorHandlers, [
            errorHandler(['cats', 'tiffany', 'friends']),
            errorHandler(['cats', '**']),
            errorHandler(['halloween', '**'], 'text/html'),
            errorHandler(['halloween', '**'], 'text/plain'),
            errorHandler(['halloween', '**'], 'application/json'),
            errorHandler(['halloween', '**'], 'application/*'),
            errorHandler(['halloween', '**']),
            errorHandler(['**']),
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

    it('filters renderers', () => {
        assert.deepStrictEqual(router('/cats').renderers, [
            renderer(['cats', '**']),
            renderer(['**']),
        ]);
    });

    it('filters nested renderers', () => {
        assert.deepStrictEqual(router('/cats/tiffany/friends').renderers, [
            errorHandler(['cats', 'tiffany', 'friends']),
            renderer(['cats', '**']),
            renderer(['**']),
        ]);
    });

    it('finds wildcard renderers', () => {
        assert.deepStrictEqual(router('/cats/rodger').renderers, [
            renderer(['cats', '**']),
            renderer(['**']),
        ]);
    });

    it('filters errorHandlers', () => {
        assert.deepStrictEqual(router('/cats').errorHandlers, [
            errorHandler(['cats', '**']),
            errorHandler(['**']),
        ]);
    });

    it('filters nested errorHandlers', () => {
        assert.deepStrictEqual(router('/cats/tiffany/friends').errorHandlers, [
            errorHandler(['cats', 'tiffany', 'friends']),
            errorHandler(['cats', '**']),
            errorHandler(['**']),
        ]);
    });

    it('finds wildcard errorHandlers', () => {
        assert.deepStrictEqual(router('/cats/rodger').errorHandlers, [
            errorHandler(['cats', '**']),
            errorHandler(['**']),
        ]);
    });
});

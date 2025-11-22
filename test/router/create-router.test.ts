import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createBranch } from '../../src/router/modules.ts';
import { createRouter } from '../../src/router/create-router.ts';
import type {
    Action,
    ErrorHandlerData,
    Pathname,
    RendererData,
    RouteData,
} from '../../src/types.ts';

const actionA = () => {};
const actionB = () => {};

function route(method: string, url?: Pathname, actions: Action[] = []): RouteData {
    return { method, url, actions };
}

function renderer(contentType = '*', action = actionA): RendererData {
    return { contentType, action };
}

function errorHandler(contentType = '*', action = actionA): ErrorHandlerData {
    return { contentType, action };
}

const halloweenBranch = createBranch({
    url: '/halloween',
    renderers: [
        renderer('text/html'),
        renderer('application/*'),
        renderer('text/plain'),
        renderer('application/json', actionA),
        renderer('application/json', actionB),
        renderer(),
    ],
    errorHandlers: [
        errorHandler('text/html'),
        errorHandler('application/*'),
        errorHandler('text/plain'),
        errorHandler('application/json', actionA),
        errorHandler('application/json', actionB),
        errorHandler(),
    ],
    routes: [route('GET')],
});

const catsBranch = createBranch({
    url: '/cats',
    routes: [
        route('GET'),
        route('GET', '/**'),
        route('POST', undefined, [actionA]),
        route('POST', undefined, [actionB]),
        route('GET', '/tiffany'),
        route('OPTIONS', '/tiffany/**', [actionA]),
        route('OPTIONS', '/tiffany/**', [actionB]),
    ],
    renderers: [renderer()],
    errorHandlers: [errorHandler()],
    branches: [
        {
            url: '/tiffany/friends',
            routes: [route('POST', '/**')],
            renderers: [renderer()],
            errorHandlers: [errorHandler()],
        },
    ],
});

const router = createRouter({
    routes: [route('GET', '/free/stuff'), route('GET', '/'), route('GET', '/**')],
    renderers: [renderer()],
    errorHandlers: [errorHandler()],
    branches: [halloweenBranch, catsBranch],
});

describe('compare', () => {
    it('filters routes', () => {
        const result = router('GET', '/cats');
        assert.deepEqual(result[2], ['GET', 'POST', 'HEAD']);
    });

    it('filters nested routes', () => {
        const result = router('GET', '/cats/tiffany');
        assert.deepEqual(result[2], ['GET', 'OPTIONS', 'HEAD']);
    });

    it('finds wildcard routes', () => {
        const result = router('GET', '/cats/rodger');
        assert.deepEqual(result[1], { wild: '/rodger' });
        assert.deepEqual(result[2], ['GET', 'HEAD']);
    });
});

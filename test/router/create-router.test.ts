import assert from 'assert';
import 'kequtest';
import { createBranch } from '../../src/main';
import createRouter from '../../src/router/create-router';
import { TErrorHandlerData, THandle, TPathname, TRendererData, TRouteData } from '../../src/types';

const handleA = () => {};
const handleB = () => {};

function route (method: string, url?: TPathname, handles: THandle[] = []): TRouteData {
    return { method, url, handles };
}

function renderer (contentType = '*', handle = handleA): TRendererData {
    return { contentType, handle };
}

function errorHandler (contentType = '*', handle = handleA): TErrorHandlerData {
    return { contentType, handle };
}

const halloweenBranch = createBranch({
    url: '/halloween',
    renderers: [
        renderer('text/html'),
        renderer('application/*'),
        renderer('text/plain'),
        renderer('application/json', handleA),
        renderer('application/json', handleB),
        renderer()
    ],
    errorHandlers: [
        errorHandler('text/html'),
        errorHandler('application/*'),
        errorHandler('text/plain'),
        errorHandler('application/json', handleA),
        errorHandler('application/json', handleB),
        errorHandler()
    ],
    routes: [
        route('GET')
    ]
});

const catsBranch = createBranch({
    url: '/cats',
    routes: [
        route('GET'),
        route('GET', '/**'),
        route('POST', undefined, [handleA]),
        route('POST', undefined, [handleB]),
        route('GET', '/tiffany'),
        route('OPTIONS', '/tiffany/**', [handleA]),
        route('OPTIONS', '/tiffany/**', [handleB])
    ],
    renderers: [
        renderer()
    ],
    errorHandlers: [
        errorHandler()
    ],
    branches: [
        {
            url: '/tiffany/friends',
            routes: [
                route('POST', '/**')
            ],
            renderers: [
                renderer()
            ],
            errorHandlers: [
                errorHandler()
            ]
        }
    ]
});

const router = createRouter({
    routes: [
        route('GET', '/free/stuff'),
        route('GET', '/'),
        route('GET', '/**')
    ],
    renderers: [
        renderer()
    ],
    errorHandlers: [
        errorHandler()
    ],
    branches: [
        halloweenBranch,
        catsBranch
    ]
});

describe('compare', () => {
    it('filters routes', () => {
        const result = router('GET', '/cats');
        assert.deepStrictEqual(result[2], ['GET', 'POST', 'HEAD']);
    });

    it('filters nested routes', () => {
        const result = router('GET', '/cats/tiffany');
        assert.deepStrictEqual(result[2], ['GET', 'OPTIONS', 'HEAD']);
    });

    it('finds wildcard routes', () => {
        const result = router('GET', '/cats/rodger');
        assert.deepStrictEqual(result[1], { wild: '/rodger' });
        assert.deepStrictEqual(result[2], ['GET', 'HEAD']);
    });
});

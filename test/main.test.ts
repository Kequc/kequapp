import assert from 'node:assert/strict';
import { it } from 'node:test';
import {
    createAction,
    createApp,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
    Ex,
    inject,
    sendFile,
    staticDirectory,
} from '../src/main.ts';

it('exports a lot of stuff', () => {
    assert.equal(typeof createApp, 'function');
    assert.equal(typeof createBranch, 'function');
    assert.equal(typeof createErrorHandler, 'function');
    assert.equal(typeof createRenderer, 'function');
    assert.equal(typeof createRoute, 'function');
    assert.equal(typeof sendFile, 'function');
    assert.equal(typeof staticDirectory, 'function');
    assert.equal(typeof createAction, 'function');
    assert.equal(typeof Ex, 'object');
});

it('accepts actions', () => {
    createApp({
        actions: [() => {}, () => {}],
    });
});

it('throws error on invalid actions', () => {
    assert.throws(
        () =>
            createApp({
                // @ts-ignore
                actions: [() => {}, 'foo'],
            }),
        {
            message: 'Branch actions item must be a function',
        },
    );
});

it('renders a response', async () => {
    const app = createApp({
        routes: [
            {
                method: 'GET',
                actions: [
                    ({ req, res }) => {
                        res.end(req.method);
                    },
                ],
            },
        ],
    });
    const { res, getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'text/plain');
    assert.equal(result, 'GET');
});

it('renders head routes', async () => {
    const app = createApp({
        routes: [
            {
                method: 'GET',
                actions: [
                    ({ req, res }) => {
                        res.end(req.method);
                    },
                ],
            },
        ],
    });

    const { res, getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'text/plain');
    assert.equal(result, 'HEAD');
});

it('renders a response for url', async () => {
    const app = createApp({
        routes: [
            {
                url: '/foo/bar',
                method: 'GET',
                actions: [
                    ({ req, res }) => {
                        res.end(req.method);
                    },
                ],
            },
        ],
    });
    const { res, getResponse } = inject(app, { url: '/foo/bar' });
    const result = await getResponse();

    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'text/plain');
    assert.equal(result, 'GET');
});

it('renders a response for funny url', async () => {
    const app = createApp({
        routes: [
            {
                url: '/@f~o+o/$b.a-r',
                method: 'GET',
                actions: [
                    ({ req, res }) => {
                        res.end(req.method);
                    },
                ],
            },
        ],
    });
    const { res, getResponse } = inject(app, { url: '/@f~o+o/$b.a-r' });
    const result = await getResponse();

    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'text/plain');
    assert.equal(result, 'GET');
});

const errorHandler = createErrorHandler({
    contentType: '*',
    action(error, { res }) {
        res.setHeader('Content-Type', 'text/plain');
        res.end(error.message);
    },
});

it('returns error when route not found', async () => {
    const app = createApp({
        errorHandlers: [errorHandler],
    });

    const { getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.deepEqual(result, 'Not Found');
});

it('ignores head routes when autoHead false', async () => {
    const app = createApp({
        routes: [
            {
                method: 'GET',
                actions: [
                    ({ req, res }) => {
                        res.end(req.method);
                    },
                ],
            },
        ],
        errorHandlers: [errorHandler],
        autoHead: false,
    });

    const { getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.deepEqual(result, 'Not Found');
});

it('ignores head routes when nested autoHead false', async () => {
    const app = createApp({
        branches: [
            {
                routes: [
                    {
                        method: 'GET',
                        actions: [
                            ({ req, res }) => {
                                res.end(req.method);
                            },
                        ],
                    },
                ],
            },
        ],
        errorHandlers: [errorHandler],
        autoHead: false,
    });

    const { getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.deepEqual(result, 'Not Found');
});

it('finalizes response when stream not ended', async () => {
    const app = createApp({
        routes: [
            {
                method: 'GET',
                actions: [
                    ({ res }) => {
                        res.write('oops');
                    },
                ],
            },
        ],
    });

    const { res, getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'text/plain');
    assert.equal(result, 'oops');
});

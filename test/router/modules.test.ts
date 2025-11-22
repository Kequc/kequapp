import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createAction,
    createApp,
    createBranch,
    createErrorHandler,
    createRenderer,
    createRoute,
} from '../../src/router/modules.ts';
import { silentLogger } from '../../src/util/logger.ts';
import { inject } from '../../src/built-in/tools/inject.ts';

describe('createApp', () => {
    it('accepts actions', () => {
        createApp({
            logger: silentLogger,
            actions: [() => {}, () => {}],
        });
    });

    it('throws error on invalid actions', () => {
        assert.throws(
            () =>
                createApp({
                    logger: silentLogger,
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
            logger: silentLogger,
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
            logger: silentLogger,
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
            logger: silentLogger,
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
            logger: silentLogger,
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
            logger: silentLogger,
            errorHandlers: [errorHandler],
        });

        const { getResponse } = inject(app, { url: '/' });
        const result = await getResponse();

        assert.deepEqual(result, 'Not Found');
    });

    it('ignores head routes when autoHead false', async () => {
        const app = createApp({
            logger: silentLogger,
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
            logger: silentLogger,
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
            logger: silentLogger,
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
});

describe('createBranch', () => {
    it('creates a branch', () => {
        const branch = {
            actions: [() => {}],
        };
        const result = createBranch(branch);

        assert.deepEqual(result, branch);
    });
});

describe('createRoute', () => {
    it('creates a route', () => {
        const route = {
            method: 'POST',
            actions: [() => {}],
        };
        const result = createRoute(route);

        assert.deepEqual(result, route);
    });
});

describe('createAction', () => {
    it('creates a action', () => {
        const action = () => {};
        const result = createAction(action);

        assert.deepEqual(result, action);
    });
});

describe('createErrorHandler', () => {
    it('creates a error handler', () => {
        const errorHandler = {
            contentType: 'application/json',
            action: () => {},
        };
        const result = createErrorHandler(errorHandler);

        assert.deepEqual(result, errorHandler);
    });
});

describe('createRenderer', () => {
    it('creates a renderer', () => {
        const renderer = {
            contentType: 'application/json',
            action: () => {},
        };
        const result = createRenderer(renderer);

        assert.deepEqual(result, renderer);
    });
});

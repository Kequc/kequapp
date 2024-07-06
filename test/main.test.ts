import assert from 'assert';
import 'kequtest';
import {
    createApp,
    createBranch,
    createErrorHandler,
    createAction,
    createRenderer,
    createRoute,
    Ex,
    inject,
    sendFile,
    staticDirectory
} from '../src/main';

it('exports a lot of stuff', () => {
    assert.strictEqual(typeof createApp, 'function');
    assert.strictEqual(typeof createBranch, 'function');
    assert.strictEqual(typeof createErrorHandler, 'function');
    assert.strictEqual(typeof createRenderer, 'function');
    assert.strictEqual(typeof createRoute, 'function');
    assert.strictEqual(typeof sendFile, 'function');
    assert.strictEqual(typeof staticDirectory, 'function');
    assert.strictEqual(typeof createAction, 'function');
    assert.strictEqual(typeof Ex, 'object');
});

it('accepts actions', () => {
    createApp({
        actions: [() => {}, () => {}]
    });
});

it('throws error on invalid actions', () => {
    assert.throws(() => createApp({
        // @ts-ignore
        actions: [() => {}, 'foo']
    }), {
        message: 'Branch actions item must be a function'
    });
});

it('renders a response', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            actions: [({ req, res }) => { res.end(req.method); }]
        }]
    });
    const { res, getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'GET');
});

it('renders head routes', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            actions: [({ req, res }) => { res.end(req.method); }]
        }]
    });

    const { res, getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'HEAD');
});

it('renders a response for url', async () => {
    const app = createApp({
        routes: [{
            url: '/foo/bar',
            method: 'GET',
            actions: [({ req, res }) => { res.end(req.method); }]
        }]
    });
    const { res, getResponse } = inject(app, { url: '/foo/bar' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'GET');
});

it('renders a response for funny url', async () => {
    const app = createApp({
        routes: [{
            url: '/@f~o+o/$b.a-r',
            method: 'GET',
            actions: [({ req, res }) => { res.end(req.method); }]
        }]
    });
    const { res, getResponse } = inject(app, { url: '/@f~o+o/$b.a-r' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'GET');
});

const errorHandler = createErrorHandler({
    contentType: '*',
    action (error, { res }) {
        res.setHeader('Content-Type', 'text/plain');
        res.end((error as any).message);
    }
});

it('returns error when route not found', async () => {
    const app = createApp({
        errorHandlers: [errorHandler]
    });

    const { getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('ignores head routes when autoHead false', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            actions: [({ req, res }) => { res.end(req.method); }]
        }],
        errorHandlers: [errorHandler],
        autoHead: false
    });

    const { getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('ignores head routes when nested autoHead false', async () => {
    const app = createApp({
        branches: [{
            routes: [{
                method: 'GET',
                actions: [({ req, res }) => { res.end(req.method); }]
            }]
        }],
        errorHandlers: [errorHandler],
        autoHead: false
    });

    const { getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('finalizes response when stream not ended', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            actions: [({ res }) => { res.write('oops'); }]
        }]
    });

    const { res, getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'oops');
});

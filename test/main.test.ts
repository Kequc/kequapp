import assert from 'assert';
import 'kequtest';
import {
    createApp,
    createBranch,
    createErrorHandler,
    createHandle,
    createRenderer,
    createRoute,
    Ex,
    inject,
    sendFile,
    staticDirectory,
    staticFile
} from '../src/main';

it('exports a lot of stuff', () => {
    assert.strictEqual(typeof createApp, 'function');
    assert.strictEqual(typeof createBranch, 'function');
    assert.strictEqual(typeof createErrorHandler, 'function');
    assert.strictEqual(typeof createRenderer, 'function');
    assert.strictEqual(typeof createRoute, 'function');
    assert.strictEqual(typeof sendFile, 'function');
    assert.strictEqual(typeof staticDirectory, 'function');
    assert.strictEqual(typeof staticFile, 'function');
    assert.strictEqual(typeof createHandle, 'function');
    assert.strictEqual(typeof Ex, 'object');
});

it('accepts handles', () => {
    createApp({
        handles: [() => {}, () => {}]
    });
});

it('throws error on invalid handles', () => {
    assert.throws(() => createApp({
        // @ts-ignore
        handles: [() => {}, 'foo']
    }), {
        message: 'Handle item must be a function'
    });
});

it('renders a response', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            handles: [({ req, res }) => { res.end(req.method); }]
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
            handles: [({ req, res }) => { res.end(req.method); }]
        }]
    });

    const { res, getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'HEAD');
});

const errorHandler = createErrorHandler({
    contentType: '*',
    handle (error, { res }) {
        res.setHeader('Content-Type', 'text/plain');
        res.end((error as any).message);
    }
});

it('returns error when route not found', async () => {
    const app = createApp({
        errorHandlers: [errorHandler],
    });

    const { getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('ignores head routes when autoHead false', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            handles: [({ req, res }) => { res.end(req.method); }]
        }],
        errorHandlers: [errorHandler]
    });

    const { getResponse } = inject(app, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('finalizes response when stream not ended', async () => {
    const app = createApp({
        routes: [{
            method: 'GET',
            handles: [({ res }) => { res.write('oops'); }]
        }]
    });

    const { res, getResponse } = inject(app, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'oops');
});

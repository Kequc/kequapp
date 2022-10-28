import assert from 'assert';
import 'kequtest';
import createGetResponse from '../../src/body/create-get-response';
import createRouter from '../../src/router/create-router';
import requestProcessor from '../../src/router/request-processor';
import {
    TAddableData,
    TConfig,
    TErrorHandlerData,
    TInject,
    TReqOptions
} from '../../src/types';
import { FakeReq, FakeRes } from '../../src/util/fake-http';

function process (branchData: TAddableData, options: TReqOptions, config: Partial<TConfig> = {}): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;
    const getResponse = createGetResponse(res);
    const _config = Object.assign({ logger: console, autoHead: true }, config);
    requestProcessor(createRouter(_config, branchData), _config, req, res);
    return { req, res, getResponse };
}

const errorHandler: TErrorHandlerData = {
    parts: ['**'],
    contentType: '*',
    handle (error, { res }) {
        res.setHeader('Content-Type', 'text/plain');
        res.end((error as any).message);
    }
};

it('renders a response', async () => {
    const branchData: TAddableData = {
        routes: [{
            parts: [],
            handles: [({ req, res }) => {
                res.end(req.method);
            }],
            method: 'GET'
        }],
        renderers: [],
        errorHandlers: []
    };

    const { res, getResponse } = process(branchData, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'GET');
});

it('renders head routes', async () => {
    const branchData: TAddableData = {
        routes: [{
            parts: [],
            handles: [({ req, res }) => {
                res.end(req.method);
            }],
            method: 'GET'
        }],
        renderers: [],
        errorHandlers: []
    };

    const { res, getResponse } = process(branchData, { url: '/', method: 'HEAD' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'HEAD');
});

it('returns error when route not found', async () => {
    const branchData: TAddableData = {
        routes: [],
        renderers: [],
        errorHandlers: [errorHandler]
    };

    const { getResponse } = process(branchData, { url: '/' });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('ignores head routes when autoHead false', async () => {
    const branchData: TAddableData = {
        routes: [{
            parts: [],
            handles: [({ req, res }) => {
                res.end(req.method);
            }],
            method: 'GET'
        }],
        renderers: [],
        errorHandlers: [errorHandler]
    };

    const { getResponse } = process(branchData, { url: '/', method: 'HEAD' }, { autoHead: false });
    const result = await getResponse();

    assert.deepStrictEqual(result, 'Not Found');
});

it('finalizes response when stream not ended', async () => {
    const branchData: TAddableData = {
        routes: [{
            parts: [],
            handles: [({ res }) => {
                res.write('oops');
            }],
            method: 'GET'
        }],
        renderers: [],
        errorHandlers: []
    };

    const { res, getResponse } = process(branchData, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, 'oops');
});

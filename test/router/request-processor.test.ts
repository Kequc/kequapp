import assert from 'assert';
import 'kequtest';
import createGetBody from '../../src/body/create-get-body';
import createGetResponse from '../../src/body/create-get-response';
import createRouter from '../../src/router/create-router';
import requestProcessor from '../../src/router/request-processor';
import {
    TAddableData,
    TErrorHandlerData,
    TInject,
    TReqOptions
} from '../../src/types';
import { FakeReq, FakeRes } from '../../src/util/fake-http';

function process (branchData: TAddableData, options: TReqOptions): TInject {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;
    const getResponse = createGetResponse(res);
    requestProcessor(createRouter(branchData), {
        req,
        res,
        url: new URL('http://fake.domain'),
        getBody: createGetBody(req)
    });
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
            handles: [({ res }) => {
                res.end('hello there');
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
    assert.strictEqual(result, 'hello there');
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

it('renders 204 when no body', async () => {
    const branchData: TAddableData = {
        routes: [{
            parts: [],
            handles: [],
            method: 'GET'
        }],
        renderers: [],
        errorHandlers: []
    };

    const { res, getResponse } = process(branchData, { url: '/' });
    const result = await getResponse();

    assert.strictEqual(res.statusCode, 204);
    assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
    assert.strictEqual(result, '');
});

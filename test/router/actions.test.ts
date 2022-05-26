import assert from 'assert';
import 'kequtest';
import createGetBody from '../../src/body/create-get-body';
import createGetResponse from '../../src/body/create-get-response';
import { renderError, renderRoute } from '../../src/router/actions';
import {
    TAddableData,
    TBundle,
    TReqOptions,
    TRouteData
} from '../../src/types';
import Ex from '../../src/util/tools/ex';
import { FakeReq, FakeRes } from '../../src/util/fake-http';

function buildBundle (options: TReqOptions): TBundle {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    return {
        req,
        res,
        url: new URL('http://fake.domain'),
        getBody: createGetBody(req),
        context: {},
        params: {}
    };
}

describe('renderRoute', () => {
    it('renders a response', async () => {
        const route: TRouteData = {
            parts: [],
            handles: [({ res }) => {
                res.end('hello there');
            }],
            method: 'GET'
        };
        const bundle = buildBundle({ url: '/' });
        const collection: TAddableData = {
            routes: [route],
            renderers: [],
            errorHandlers: []
        };

        await renderRoute(collection, bundle, route, {
            silent: false,
            autoHead: true
        });

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), undefined);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
        assert.strictEqual(res.getHeader('Valid'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), undefined);

        const result = await createGetResponse(res)();

        assert.strictEqual(result, 'hello there');
    });

    it('includes cors header when options available', async () => {
        const route: TRouteData = {
            parts: [],
            handles: [],
            method: 'GET'
        };
        const bundle = buildBundle({ url: '/' });
        const collection: TAddableData = {
            routes: [route, {
                parts: [],
                handles: [],
                method: 'OPTIONS'
            }],
            renderers: [],
            errorHandlers: []
        };

        await renderRoute(collection, bundle, route, {
            silent: false,
            autoHead: true
        });

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
        assert.strictEqual(res.getHeader('Valid'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), undefined);
    });

    it('includes additional headers when method is options', async () => {
        const route: TRouteData = {
            parts: [],
            handles: [],
            method: 'OPTIONS'
        };
        const bundle = buildBundle({
            url: '/',
            method: 'OPTIONS',
            headers: {
                'access-control-request-headers': 'X-PINGOTHER, Content-Type'
            }
        });
        const collection: TAddableData = {
            routes: [route, {
                parts: [],
                handles: [],
                method: 'GET'
            }],
            renderers: [],
            errorHandlers: []
        };

        await renderRoute(collection, bundle, route, {
            silent: false,
            autoHead: true
        });

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Content-Length'), 0);
        assert.strictEqual(res.getHeader('Valid'), 'GET, HEAD, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'GET, HEAD, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'X-PINGOTHER, Content-Type');
    });

    it('ignored head when autoHead is set to false', async () => {
        const route: TRouteData = {
            parts: [],
            handles: [],
            method: 'OPTIONS'
        };
        const bundle = buildBundle({
            url: '/',
            method: 'OPTIONS',
            headers: {
                'access-control-request-headers': 'X-PINGOTHER, Content-Type'
            }
        });
        const collection: TAddableData = {
            routes: [route, {
                parts: [],
                handles: [],
                method: 'GET'
            }],
            renderers: [],
            errorHandlers: []
        };

        await renderRoute(collection, bundle, route, {
            silent: false,
            autoHead: false
        });

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Content-Length'), 0);
        assert.strictEqual(res.getHeader('Valid'), 'GET, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'GET, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'X-PINGOTHER, Content-Type');
    });
});

describe('renderError', () => {
    it('renders an error', async () => {
        const bundle = buildBundle({ url: '/' });
        const collection: TAddableData = {
            routes: [],
            renderers: [],
            errorHandlers: [{
                parts: [],
                contentType: '*',
                handle (ex, { res }) {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(ex.message);
                }
            }]
        };

        await renderError(collection, bundle, Ex.NotFound());

        const { res } = bundle;

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');

        const result = await createGetResponse(res)();

        assert.deepStrictEqual(result, 'Not Found');
    });
});

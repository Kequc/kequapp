import assert from 'assert';
import 'kequtest';
import createGetBody from '../../src/body/create-get-body';
import createGetResponse from '../../src/body/create-get-response';
import { renderError, renderRoute } from '../../src/router/actions';
import {
    TBundle,
    TReqOptions,
    TRoute
} from '../../src/types';
import Ex from '../../src/built-in/tools/ex';
import { FakeReq, FakeRes } from '../../src/util/fake-http';
import createCookies from '../../src/router/create-cookies';

const logger = {
    log: util.spy(),
    error: util.spy(),
    warn: util.spy(),
    info: util.spy(),
    http: util.spy(),
    verbose: util.spy(),
    debug: util.spy(),
    silly: util.spy()
};

function buildBundle (options: TReqOptions): TBundle {
    const req = new FakeReq(options) as any;
    const res = new FakeRes() as any;

    return {
        req,
        res,
        url: new URL('http://fake.domain'),
        cookies: createCookies(req, res),
        getBody: createGetBody(req),
        context: {},
        params: {},
        methods: [],
        logger
    };
}

describe('renderRoute', () => {
    it('renders a response', async () => {
        const route: TRoute = {
            actions: [({ res }) => {
                res.end('hello there');
            }],
            method: 'GET',
            regexp: new RegExp(''),
            autoHead: true,
            logger,
            renderers: [],
            errorHandlers: []
        };
        const bundle = buildBundle({ url: '/' });

        await renderRoute(route, bundle);

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
        const route: TRoute = {
            actions: [],
            method: 'GET',
            regexp: new RegExp(''),
            autoHead: true,
            logger,
            renderers: [],
            errorHandlers: []
        };
        const bundle = buildBundle({ url: '/' });

        bundle.methods.push('GET', 'HEAD', 'OPTIONS');

        await renderRoute(route, bundle);

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');
        assert.strictEqual(res.getHeader('Valid'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), undefined);
    });

    it('includes additional headers when method is options', async () => {
        const route: TRoute = {
            actions: [],
            method: 'OPTIONS',
            regexp: new RegExp(''),
            autoHead: true,
            logger,
            renderers: [],
            errorHandlers: []
        };
        const bundle = buildBundle({
            url: '/',
            method: 'OPTIONS',
            headers: {
                'access-control-request-headers': 'X-PINGOTHER, Content-Type'
            }
        });

        bundle.methods.push('GET', 'HEAD', 'OPTIONS');

        await renderRoute(route, bundle);

        const { res } = bundle;

        assert.strictEqual(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.strictEqual(res.statusCode, 204);
        assert.strictEqual(res.getHeader('Content-Length'), 0);
        assert.strictEqual(res.getHeader('Valid'), 'GET, HEAD, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Methods'), 'GET, HEAD, OPTIONS');
        assert.strictEqual(res.getHeader('Access-Control-Allow-Headers'), 'X-PINGOTHER, Content-Type');
    });
});

describe('renderError', () => {
    it('renders an error', async () => {
        const bundle = buildBundle({ url: '/' });
        const route: TRoute = {
            actions: [],
            method: 'OPTIONS',
            regexp: new RegExp(''),
            autoHead: true,
            logger,
            renderers: [],
            errorHandlers: [{
                contentType: '*',
                action (ex, { res }) {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(ex.message);
                }
            }]
        };

        await renderError(route, bundle, Ex.NotFound());

        const { res } = bundle;

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.getHeader('Content-Type'), 'text/plain');

        const result = await createGetResponse(res)();

        assert.deepStrictEqual(result, 'Not Found');
    });
});

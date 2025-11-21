import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, it } from 'node:test';
import createGetBody from '../../src/body/create-get-body.ts';
import createGetResponse from '../../src/body/create-get-response.ts';
import Ex from '../../src/built-in/tools/ex.ts';
import { renderError, renderRoute } from '../../src/router/actions.ts';
import createCookies from '../../src/router/create-cookies.ts';
import type { Bundle, ReqOptions, Route } from '../../src/types.ts';
import { FakeReq, FakeRes } from '../../src/util/fake-http.ts';
import { silentLogger } from '../../src/util/logger.ts';

function buildBundle(options: ReqOptions): Bundle {
    const req = new FakeReq(options) as unknown as IncomingMessage;
    const res = new FakeRes() as unknown as ServerResponse;

    return {
        req,
        res,
        url: new URL('http://fake.domain'),
        cookies: createCookies(req, res),
        getBody: createGetBody(req),
        context: {},
        params: {},
        methods: [],
    };
}

describe('renderRoute', () => {
    it('renders a response', async () => {
        const route: Route = {
            actions: [
                ({ res }) => {
                    res.end('hello there');
                },
            ],
            method: 'GET',
            regexp: /(?:)/,
            autoHead: true,
            logger: silentLogger,
            renderers: [],
            errorHandlers: [],
        };
        const bundle = buildBundle({ url: '/' });

        await renderRoute(route, bundle);

        const { res } = bundle;

        assert.equal(res.getHeader('Access-Control-Allow-Origin'), undefined);
        assert.equal(res.statusCode, 200);
        assert.equal(res.getHeader('Content-Type'), 'text/plain');
        assert.equal(res.getHeader('Valid'), undefined);
        assert.equal(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.equal(res.getHeader('Access-Control-Allow-Headers'), undefined);

        const result = await createGetResponse(res)();

        assert.equal(result, 'hello there');
    });

    it('includes cors header when options available', async () => {
        const route: Route = {
            actions: [],
            method: 'GET',
            regexp: /(?:)/,
            autoHead: true,
            logger: silentLogger,
            renderers: [],
            errorHandlers: [],
        };
        const bundle = buildBundle({ url: '/' });

        bundle.methods.push('GET', 'HEAD', 'OPTIONS');

        await renderRoute(route, bundle);

        const { res } = bundle;

        assert.equal(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.equal(res.statusCode, 200);
        assert.equal(res.getHeader('Content-Type'), 'text/plain');
        assert.equal(res.getHeader('Valid'), undefined);
        assert.equal(res.getHeader('Access-Control-Allow-Methods'), undefined);
        assert.equal(res.getHeader('Access-Control-Allow-Headers'), undefined);
    });

    it('includes additional headers when method is options', async () => {
        const route: Route = {
            actions: [],
            method: 'OPTIONS',
            regexp: /(?:)/,
            autoHead: true,
            logger: silentLogger,
            renderers: [],
            errorHandlers: [],
        };
        const bundle = buildBundle({
            url: '/',
            method: 'OPTIONS',
            headers: {
                'access-control-request-headers': 'X-PINGOTHER, Content-Type',
            },
        });

        bundle.methods.push('GET', 'HEAD', 'OPTIONS');

        await renderRoute(route, bundle);

        const { res } = bundle;

        assert.equal(res.getHeader('Access-Control-Allow-Origin'), '*');
        assert.equal(res.statusCode, 204);
        assert.equal(res.getHeader('Content-Length'), 0);
        assert.equal(res.getHeader('Valid'), 'GET, HEAD, OPTIONS');
        assert.equal(
            res.getHeader('Access-Control-Allow-Methods'),
            'GET, HEAD, OPTIONS',
        );
        assert.equal(
            res.getHeader('Access-Control-Allow-Headers'),
            'X-PINGOTHER, Content-Type',
        );
    });
});

describe('renderError', () => {
    it('renders an error', async () => {
        const logger = silentLogger;
        const bundle = buildBundle({ url: '/' });
        const route: Route = {
            actions: [],
            method: 'OPTIONS',
            regexp: /(?:)/,
            autoHead: true,
            logger,
            renderers: [],
            errorHandlers: [
                {
                    contentType: '*',
                    action(ex, { res }) {
                        res.setHeader('Content-Type', 'text/plain');
                        res.end(ex.message);
                    },
                },
            ],
        };

        await renderError(route, bundle, Ex.NotFound(), logger);

        const { res } = bundle;

        assert.equal(res.statusCode, 404);
        assert.equal(res.getHeader('Content-Type'), 'text/plain');

        const result = await createGetResponse(res)();

        assert.deepEqual(result, 'Not Found');
    });
});

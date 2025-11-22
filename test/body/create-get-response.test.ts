import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGetResponse } from '../../src/body/create-get-response.ts';
import { FakeRes } from '../../src/util/fake-http.ts';

describe('createGetResponse', () => {
    it('parses text responses', async () => {
        const res = new FakeRes();
        res.setHeader('Content-Type', 'text/plain');

        // simulate application writing to the response
        res.write('hello world');
        res.end();

        const getResponse = createGetResponse(res);
        const body = await getResponse();

        assert.equal(body, 'hello world');
    });

    it('parses JSON responses', async () => {
        const res = new FakeRes();
        res.setHeader('Content-Type', 'application/json');

        const payload = { a: 1, b: 'two' };
        res.write(JSON.stringify(payload));
        res.end();

        const getResponse = createGetResponse(res);
        const body = await getResponse();

        assert.deepEqual(body, payload);
    });

    it('returns raw Buffer when raw option is true', async () => {
        const res = new FakeRes();
        res.setHeader('Content-Type', 'application/json');

        const payload = { ok: true };
        const json = JSON.stringify(payload);
        res.write(json);
        res.end();

        const getResponse = createGetResponse(res);

        const raw = await getResponse({ raw: true });
        assert.ok(Buffer.isBuffer(raw));
        assert.equal(raw.toString(), json);
    });

    it('returns Buffer for unknown/opaque content types', async () => {
        const res = new FakeRes();
        res.setHeader('Content-Type', 'application/octet-stream');

        const buf = Buffer.from([1, 2, 3, 4]);
        res.write(buf);
        res.end();

        const getResponse = createGetResponse(res);
        const body = await getResponse();

        assert.ok(Buffer.isBuffer(body));
        assert.deepEqual(body, buf);
    });
});

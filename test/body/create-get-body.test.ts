import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import createGetBody from '../../src/body/create-get-body.ts';
import { FakeReq } from '../../src/util/fake-http.ts';

describe('createGetBody', () => {
    it('throws when a required field is missing (default throws = true)', async () => {
        const req = new FakeReq({
            headers: { 'content-type': 'application/json' },
            body: '{}',
        });

        const getBody = createGetBody(req);

        await assert.rejects(
            async () => {
                await getBody<{ name?: string }>({ required: ['name'] });
            },
            {
                statusCode: 422,
                message: 'Value name is required',
            },
        );
    });

    it('returns { ok: false, errors } when throws is false and validation fails', async () => {
        const req = new FakeReq({
            headers: { 'content-type': 'application/json' },
            body: '{}',
        });

        const getBody = createGetBody(req);

        const result = await getBody<{ name?: string }>({
            required: ['name'],
            throws: false,
        });

        assert.equal(result.ok, false);
        assert.deepEqual(result.errors, { name: 'is required' });
    });

    it('returns { ok: true, ...data } when throws is false and validation passes', async () => {
        const req = new FakeReq({
            headers: { 'content-type': 'application/json' },
            body: '{ "name": "alice" }',
        });

        const getBody = createGetBody(req);

        const result = await getBody<{ name: string }>({
            required: ['name'],
            throws: false,
        });

        assert.equal(result.ok, true);
        assert.equal(result.name, 'alice');
    });

    it('uses per-field validator functions and returns their messages when invalid', async () => {
        const req = new FakeReq({
            headers: { 'content-type': 'application/json' },
            body: '{ "name": "" }',
        });

        const getBody = createGetBody(req);

        const result = await getBody<{ name?: string }>({
            validate: {
                name: (v) => (v ? undefined : 'too short'),
            },
            throws: false,
        });

        assert.equal(result.ok, false);
        assert.deepEqual(result.errors, { name: 'too short' });
    });

    it('parses streamed body chunks into JSON', async () => {
        // create the FakeReq as its concrete type so we can write into it,
        // then cast to IncomingMessage only when passing into createGetBody.
        const req = new FakeReq({
            headers: { 'content-type': 'application/json' },
            body: null,
        });

        // simulate streaming by writing chunks then ending the stream
        req.write('{"n');
        req.write('ame":');
        req.write('"Bob"}');
        req.end();

        const getBody = createGetBody(req);
        const result = await getBody<{ name: string }>();
        assert.equal(result.name, 'Bob');
    });
});

import assert from 'node:assert/strict';
import { it } from 'node:test';
import { Ex } from '../../../src/built-in/tools/ex.ts';

it('exports a few common errors', () => {
    const keys: (keyof typeof Ex)[] = ['Unauthorized', 'NotFound', 'BadRequest'];

    for (const key of keys) {
        assert.equal(typeof Ex[key], 'function');
    }
});

it('can create an error', () => {
    const result = Ex.BadGateway('test message', { test: 'more info', cause: 'hello' });

    assert.equal(result.message, 'test message');
    assert.equal(result.name, 'BadGateway');
    assert.equal(result.statusCode, 502);
    assert.equal(result.cause, 'hello');
    assert.deepEqual(result.info, { test: 'more info' });
    assert.ok(result instanceof Error);
});

it('allows creation of custom errors', () => {
    const result = Ex.StatusCode(1001, 'test message', { test: 'more info', cause: 'hello' });

    assert.equal(result.message, 'test message');
    assert.equal(result.name, 'Error');
    assert.equal(result.statusCode, 1001);
    assert.equal(result.cause, 'hello');
    assert.deepEqual(result.info, { test: 'more info' });
    assert.ok(result instanceof Error);
});

it('allows creation of custom known errors', () => {
    const result = Ex.StatusCode(404, 'test message', { test: 'more info', cause: 'hello' });

    assert.equal(result.message, 'test message');
    assert.equal(result.name, 'NotFound');
    assert.equal(result.statusCode, 404);
    assert.equal(result.cause, 'hello');
    assert.deepEqual(result.info, { test: 'more info' });
    assert.ok(result instanceof Error);
});

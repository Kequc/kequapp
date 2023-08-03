import assert from 'assert';
import 'kequtest';
import Ex from '../../../src/built-in/tools/ex';

it('exports a few common errors', () => {
    const keys = ['Unauthorized', 'NotFound', 'BadRequest'];

    for (const key of keys) {
        assert.strictEqual(typeof Ex[key], 'function');
    }
});

it('can create an error', () => {
    const result = Ex.BadGateway('test message', 'more info');

    assert.strictEqual(result.message, 'test message');
    assert.strictEqual(result.name, 'BadGateway');
    assert.strictEqual(result.statusCode, 502);
    assert.deepStrictEqual(result.info, ['more info']);
    assert.ok(result instanceof Error);
});

it('allows creation of custom errors', () => {
    const result = Ex.StatusCode(1001, 'test message', 'more info');

    assert.strictEqual(result.message, 'test message');
    assert.strictEqual(result.name, 'Error');
    assert.strictEqual(result.statusCode, 1001);
    assert.deepStrictEqual(result.info, ['more info']);
    assert.ok(result instanceof Error);
});

it('allows creation of custom known errors', () => {
    const result = Ex.StatusCode(404, 'test message', 'more info');

    assert.strictEqual(result.message, 'test message');
    assert.strictEqual(result.name, 'NotFound');
    assert.strictEqual(result.statusCode, 404);
    assert.deepStrictEqual(result.info, ['more info']);
    assert.ok(result instanceof Error);
});

import assert from 'node:assert/strict';
import { it } from 'node:test';
import { headerAttributes } from '../../src/util/header-attributes.ts';

it('parses attributes', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses attributes with quotes', () => {
    const result = headerAttributes('multipart/form-data; boundary="boundary1"; name="name1"');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses attributes with spaces', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1 name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses attributes with commas', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1, name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses attributes with colons', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1: name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses attributes with line', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1| name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses strange attributes in quotes', () => {
    const result = headerAttributes('multipart/form-data; boundary="boundary1;|?:, name=name1"');
    assert.deepEqual(result, {
        boundary: 'boundary1;|?:, name=name1',
    });
});

it('actions mixed', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1"');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('actions poorly formatted', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
    });
});

it('decodes other formats', () => {
    const result = headerAttributes('foo=bar; hello="there"; baz=qux');
    assert.deepEqual(result, {
        foo: 'bar',
        hello: 'there',
        baz: 'qux',
    });
});

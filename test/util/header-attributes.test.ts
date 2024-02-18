import assert from 'assert';
import 'kequtest';
import headerAttributes from '../../src/util/header-attributes';

it('parses attributes', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with quotes', () => {
    const result = headerAttributes('multipart/form-data; boundary="boundary1"; name="name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with spaces', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1 name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with commas', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1, name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with colons', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1: name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with line', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1| name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses strange attributes in quotes', () => {
    const result = headerAttributes('multipart/form-data; boundary="boundary1;|?:, name=name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1;|?:, name=name1'
    });
});

it('handles mixed', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('handles poorly formatted', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1'
    });
});

it('decodes other formats', () => {
    const result = headerAttributes('foo=bar; hello="there"; baz=qux');
    assert.deepStrictEqual(result, {
        foo: 'bar',
        hello: 'there',
        baz: 'qux'
    });
});

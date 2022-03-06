import 'kequtest';
import assert from 'assert';
import headerAttributes from '../../src/util/header-attributes';

it('parses attributes', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with quotes', function () {
    const result = headerAttributes('multipart/form-data; boundary="boundary1"; name="name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with spaces', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1 name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with commas', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1, name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with colons', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1: name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses attributes with line', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1| name=name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('parses strange attributes in quotes', function () {
    const result = headerAttributes('multipart/form-data; boundary="boundary1;|?:, name=name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1;|?:, name=name1'
    });
});

it('handles mixed', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1"');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1',
        name: 'name1'
    });
});

it('handles poorly formatted', function () {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name="name1');
    assert.deepStrictEqual(result, {
        boundary: 'boundary1'
    });
});

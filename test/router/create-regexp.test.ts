import assert from 'assert';
import 'kequtest';
import createRegexp, { PARA, WILD } from '../../src/router/create-regexp';

const S = '\\/';

it('creates a regexp', () => {
    const regexp = createRegexp('/hello/there/101');

    assert.ok(regexp instanceof RegExp);
    assert.strictEqual(regexp.toString(), `/^${S}hello${S}there${S}101$/i`);

    assert.ok(regexp.test('/hello/there/101'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/there/101/foo'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/there/101'.match(regexp)?.groups, {});
});

it('creates a wild regexp', () => {
    const regexp = createRegexp('/hello/there/**');

    assert.ok(regexp instanceof RegExp);
    assert.strictEqual(regexp.toString(), `/^${S}hello${S}there(?<wild>${WILD})$/i`);

    assert.ok(regexp.test('/hello/there'));
    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/there/101/foo'));

    assert.ok(!regexp.test('/hello//101/foo'));
    assert.ok(!regexp.test('/hello/101/foo'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/there/101/foo'.match(regexp)?.groups, {
        wild: '/foo/bar'
    });
});

it('creates a param regexp', () => {
    const regexp = createRegexp('/hello/:there/101');

    assert.ok(regexp instanceof RegExp);
    assert.strictEqual(regexp.toString(), `/^${S}hello${S}(?<there>${PARA})${S}101$/i`);

    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/foo/101'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/foo//101'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/101/foo'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/cats/101'.match(regexp)?.groups, {
        there: 'cats'
    });
});

it('creates a wild param regexp', () => {
    const regexp = createRegexp('/hello/:there/101/**');

    assert.ok(regexp instanceof RegExp);
    assert.strictEqual(regexp.toString(), `/^${S}hello${S}(?<there>${PARA})${S}101(?<wild>${WILD})$/i`);

    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/there/101/foo'));
    assert.ok(regexp.test('/hello/there/101/foo/bar'));
    assert.ok(regexp.test('/hello/foo/101/bar'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/there/101//foo'));
    assert.ok(!regexp.test('/hello/there//101/foo/bar'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/cats/101/foo/bar'.match(regexp)?.groups, {
        there: 'cats',
        wild: '/foo/bar'
    });
});

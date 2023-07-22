import assert from 'assert';
import 'kequtest';
import createRegex, { PARA, WILD } from '../../src/router/create-regex';

const S = '\\/';

it('creates a regex', () => {
    const regex = createRegex('/hello/there/101');

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}there${S}101$/i`);

    assert.ok(regex.test('/hello/there/101'));

    assert.ok(!regex.test('/hello//there/101'));
    assert.ok(!regex.test('/hello/there/101/foo'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/there/101'.match(regex)?.groups, {});
});

it('creates a wild regex', () => {
    const regex = createRegex('/hello/there/**');

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}there(?<wild>${WILD})$/i`);

    assert.ok(regex.test('/hello/there'));
    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/there/101/foo'));

    assert.ok(!regex.test('/hello//101/foo'));
    assert.ok(!regex.test('/hello/101/foo'));
    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/there/101/foo'.match(regex)?.groups, {
        wild: '/foo/bar'
    });
});

it('creates a param regex', () => {
    const regex = createRegex('/hello/:there/101');

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}(?<there>${PARA})${S}101$/i`);

    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/foo/101'));

    assert.ok(!regex.test('/hello//there/101'));
    assert.ok(!regex.test('/hello/foo//101'));
    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/101/foo'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/cats/101'.match(regex)?.groups, {
        there: 'cats'
    });
});

it('creates a wild param regex', () => {
    const regex = createRegex('/hello/:there/101/**');

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}(?<there>${PARA})${S}101(?<wild>${WILD})$/i`);

    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/there/101/foo'));
    assert.ok(regex.test('/hello/there/101/foo/bar'));
    assert.ok(regex.test('/hello/foo/101/bar'));

    assert.ok(!regex.test('/hello//there/101'));
    assert.ok(!regex.test('/hello/there/101//foo'));
    assert.ok(!regex.test('/hello/there//101/foo/bar'));
    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));

    assert.deepStrictEqual('/hello/cats/101/foo/bar'.match(regex)?.groups, {
        there: 'cats',
        wild: '/foo/bar'
    });
});

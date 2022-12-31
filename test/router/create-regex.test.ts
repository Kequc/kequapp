import assert from 'assert';
import 'kequtest';
import createRegex, { PARA, WILD } from '../../src/router/create-regex';

const S = '\\/';

it('creates a regex', () => {
    const regex = createRegex(['hello', 'there', '101']);

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}there${S}101$/i`);

    assert.ok(regex.test('/hello/there/101'));

    assert.ok(!regex.test('/hello/there/101/foo'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));
});

it('creates a wild regex', () => {
    const regex = createRegex(['hello', 'there', '**']);

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}there${WILD}$/i`);

    assert.ok(regex.test('/hello/there'));
    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/there/101/foo'));

    assert.ok(!regex.test('/hello/101/foo'));
    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));
});

it('creates a param regex', () => {
    const regex = createRegex(['hello', ':there', '101']);

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}${PARA}${S}101$/i`);

    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/foo/101'));

    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/101/foo'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));
});

it('creates a wild param regex', () => {
    const regex = createRegex(['hello', ':there', '101', '**']);

    assert.ok(regex instanceof RegExp);
    assert.strictEqual(regex.toString(), `/^${S}hello${S}${PARA}${S}101${WILD}$/i`);

    assert.ok(regex.test('/hello/there/101'));
    assert.ok(regex.test('/hello/there/101/foo'));
    assert.ok(regex.test('/hello/there/101/foo/bar'));
    assert.ok(regex.test('/hello/foo/101/bar'));

    assert.ok(!regex.test('/hello/101/there'));
    assert.ok(!regex.test('/hello/there'));
    assert.ok(!regex.test('/hello/there/**'));
    assert.ok(!regex.test('/hello/there/:boo'));
});

import assert from 'node:assert/strict';
import { it } from 'node:test';
import createRegexp, { PARA, WILD } from '../../src/router/create-regexp.ts';
import { matchGroups } from '../../src/router/util/extract.ts';

const S = '\\/';

it('creates a regexp', () => {
    const regexp = createRegexp('/hello/there/101');

    assert.ok(regexp instanceof RegExp);
    assert.equal(regexp.toString(), `/^${S}hello${S}there${S}101$/i`);

    assert.ok(regexp.test('/hello/there/101'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/there/101/foo'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepEqual(matchGroups('/hello/there/101', regexp), {});
});

it('creates a wild regexp', () => {
    const regexp = createRegexp('/hello/there/**');

    assert.ok(regexp instanceof RegExp);
    assert.equal(regexp.toString(), `/^${S}hello${S}there(?<wild>${WILD})$/i`);

    assert.ok(regexp.test('/hello/there'));
    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/there/101/foo'));
    assert.ok(regexp.test('/hello/there/**'));
    assert.ok(regexp.test('/hello/there/:boo'));

    assert.ok(!regexp.test('/hello//101/foo'));
    assert.ok(!regexp.test('/hello/101/foo'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello'));

    assert.deepEqual(matchGroups('/hello/there/101/foo', regexp), {
        wild: '/101/foo',
    });
});

it('creates a param regexp', () => {
    const regexp = createRegexp('/hello/:there/101');

    assert.ok(regexp instanceof RegExp);
    assert.equal(
        regexp.toString(),
        `/^${S}hello${S}(?<there>${PARA})${S}101$/i`,
    );

    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/foo/101'));
    assert.ok(regexp.test('/hello/09a511fe-baa9-4080-b228-6a5e9b16a67c/101'));
    assert.ok(regexp.test('/hello/foo_foo/101'));
    assert.ok(regexp.test('/hello/@foo/101'));
    assert.ok(regexp.test('/hello/+foo/101'));
    assert.ok(regexp.test('/hello/foo.foo/101'));
    assert.ok(regexp.test('/hello/~foo/101'));
    assert.ok(regexp.test('/hello/#there/101'));
    assert.ok(regexp.test('/hello/?there/101'));
    assert.ok(regexp.test('/hello/&there/101'));
    assert.ok(regexp.test('/hello/=there/101'));
    assert.ok(regexp.test('/hello/%there/101'));
    assert.ok(regexp.test('/hello/:there/101'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/foo//101'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/101/foo'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepEqual(matchGroups('/hello/cats/101', regexp), {
        there: 'cats',
    });
});

it('creates a wild param regexp', () => {
    const regexp = createRegexp('/hello/:there/101/**');

    assert.ok(regexp instanceof RegExp);
    assert.equal(
        regexp.toString(),
        `/^${S}hello${S}(?<there>${PARA})${S}101(?<wild>${WILD})$/i`,
    );

    assert.ok(regexp.test('/hello/there/101'));
    assert.ok(regexp.test('/hello/there/101/foo'));
    assert.ok(
        regexp.test('/hello/there/101/09a511fe-baa9-4080-b228-6a5e9b16a67c'),
    );
    assert.ok(regexp.test('/hello/there/101/foo_foo'));
    assert.ok(regexp.test('/hello/there/101/@foo'));
    assert.ok(regexp.test('/hello/there/101/+foo'));
    assert.ok(regexp.test('/hello/there/101/foo.foo'));
    assert.ok(regexp.test('/hello/there/101/~foo'));
    assert.ok(regexp.test('/hello/there/101/foo/bar'));
    assert.ok(regexp.test('/hello/foo/101/bar'));
    assert.ok(regexp.test('/hello/there/101//foo'));
    assert.ok(regexp.test('/hello/there/101/&foo'));
    assert.ok(regexp.test('/hello/there/101/=foo'));
    assert.ok(regexp.test('/hello/there/101/%foo'));
    assert.ok(regexp.test('/hello/there/101/:foo'));

    assert.ok(!regexp.test('/hello//there/101'));
    assert.ok(!regexp.test('/hello/there//101/foo/bar'));
    assert.ok(!regexp.test('/hello/101/there'));
    assert.ok(!regexp.test('/hello/there'));
    assert.ok(!regexp.test('/hello/there/**'));
    assert.ok(!regexp.test('/hello/there/:boo'));

    assert.deepEqual(matchGroups('/hello/cats/101/foo/bar', regexp), {
        there: 'cats',
        wild: '/foo/bar',
    });
});

it('escapes funny inputs', () => {
    assert.equal(
        createRegexp('/th.re/101').toString(),
        `/^${S}th\\.re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th+re/101').toString(),
        `/^${S}th\\+re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th^re/101').toString(),
        `/^${S}th\\^re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th$re/101').toString(),
        `/^${S}th\\$re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th|re/101').toString(),
        `/^${S}th\\|re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th(re)/101').toString(),
        `/^${S}th\\(re\\)${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th}re{/101').toString(),
        `/^${S}th\\}re\\{${S}101$/i`,
    );
    assert.equal(
        createRegexp('/th-re/101').toString(),
        `/^${S}th-re${S}101$/i`,
    );
    assert.equal(
        createRegexp('/~there/101').toString(),
        `/^${S}~there${S}101$/i`,
    );
    assert.equal(
        createRegexp('/@there/101').toString(),
        `/^${S}@there${S}101$/i`,
    );
    assert.equal(
        createRegexp('/@f~o+o/$b.a-r').toString(),
        `/^${S}@f~o\\+o${S}\\$b\\.a-r$/i`,
    );
});

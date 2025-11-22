import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { createCookies } from '../../src/router/create-cookies.ts';
import type { Cookies } from '../../src/types.ts';

function buildCookies(headers: { cookie?: string } = {}, setHeader = () => {}): Cookies {
    const fakeReq = { headers };
    const fakeRes = { setHeader };

    return createCookies(fakeReq, fakeRes);
}

describe('get', () => {
    it('gets a cookie', () => {
        const cookies = buildCookies({
            cookie: 'hello=there',
        });

        assert.equal(cookies.get('hello'), 'there');
    });

    it('gets a specific cookie', () => {
        const cookies = buildCookies({
            cookie: 'foo=bar; hello=there; baz=qux',
        });

        assert.equal(cookies.get('hello'), 'there');
    });

    it('actions malformed cookie', () => {
        const cookies = buildCookies({
            cookie: 'foo=bar;  hello=there;baz=qux;',
        });

        assert.equal(cookies.get('foo'), 'bar');
        assert.equal(cookies.get('hello'), 'there');
        assert.equal(cookies.get('baz'), 'qux');
    });

    it('gets a funny cookie', () => {
        const cookies = buildCookies({
            cookie: 'hello=1%2B2%3D3',
        });

        assert.equal(cookies.get('hello'), '1+2=3');
    });

    it('can read dumb cookies', () => {
        const cookies = buildCookies({
            cookie: 'foo; bar; hello=there; baz',
        });

        assert.equal(cookies.get('foo'), '');
        assert.equal(cookies.get('bar'), '');
        assert.equal(cookies.get('hello'), 'there');
        assert.equal(cookies.get('baz'), '');
    });

    it('does not parse an unnecessary cookie', () => {
        const cookies = buildCookies();

        assert.equal(cookies.get(''), undefined);
    });
});

describe('set', () => {
    it('sets a cookie', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there');

        assert.equal(cookies.get('hello'), 'there');
        assert.equal(setHeader.mock.callCount(), 1);
        assert.deepEqual(setHeader.mock.calls[0].arguments, [
            'Set-Cookie',
            ['hello=there; Path=/'],
        ]);
    });

    it('sets a cookie with options', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there', {
            maxAge: 1000,
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
        });

        assert.equal(cookies.get('hello'), 'there');
        assert.equal(setHeader.mock.callCount(), 1);
        assert.deepEqual(setHeader.mock.calls[0].arguments, [
            'Set-Cookie',
            ['hello=there; Path=/; Max-Age=1000; Secure; HttpOnly; SameSite=Strict'],
        ]);
    });

    it('sets a funny cookie', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', '1+2=3', { maxAge: 1000 });

        assert.equal(cookies.get('hello'), '1+2=3');
        assert.equal(setHeader.mock.callCount(), 1);
        assert.deepEqual(setHeader.mock.calls[0].arguments, [
            'Set-Cookie',
            ['hello=1%2B2%3D3; Path=/; Max-Age=1000'],
        ]);
    });

    it('sets multiple cookies', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies(
            {
                cookie: 'hello=old',
            },
            setHeader,
        );

        assert.equal(cookies.get('hello'), 'old');

        cookies.set('hello', 'changed', { maxAge: 1000 });
        cookies.set('foo', 'bar', { maxAge: 1000 });
        cookies.set('hello', 'there');

        assert.equal(cookies.get('hello'), 'there');
        assert.equal(cookies.get('foo'), 'bar');
        assert.equal(setHeader.mock.callCount(), 3);
        assert.deepEqual(setHeader.mock.calls[2].arguments, [
            'Set-Cookie',
            ['hello=there; Path=/', 'foo=bar; Path=/; Max-Age=1000'],
        ]);
    });

    it('prevents use of invalid cookie names', () => {
        const cookies = buildCookies();

        assert.throws(() => {
            cookies.set('hello;there', 'value');
        });
        assert.throws(() => {
            cookies.set('hello=there', 'value');
        });
        assert.throws(() => {
            cookies.set('hello,there', 'value');
        });
        assert.throws(() => {
            cookies.set('hello there', 'value');
        });
    });
});

describe('remove', () => {
    it('removes a cookie', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies(
            {
                cookie: 'hello=there',
            },
            setHeader,
        );

        assert.equal(cookies.get('hello'), 'there');

        cookies.remove('hello');

        assert.equal(cookies.get('hello'), undefined);
        assert.equal(setHeader.mock.callCount(), 1);
        assert.deepEqual(setHeader.mock.calls[0].arguments, [
            'Set-Cookie',
            ['hello=; Path=/; Max-Age=0'],
        ]);
    });

    it('removes an added cookie', () => {
        const setHeader = mock.fn();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there');

        assert.equal(cookies.get('hello'), 'there');

        cookies.remove('hello');

        assert.equal(cookies.get('hello'), undefined);
        assert.equal(setHeader.mock.callCount(), 2);
        assert.deepEqual(setHeader.mock.calls[1].arguments, [
            'Set-Cookie',
            ['hello=; Path=/; Max-Age=0'],
        ]);
    });
});

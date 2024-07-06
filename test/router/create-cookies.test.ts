import assert from 'assert';
import 'kequtest';
import createCookies from '../../src/router/create-cookies';
import { TCookies } from '../../src/types';

function buildCookies (headers: { cookie?: string } = {}, setHeader = () => {}): TCookies {
    const fakeReq = { headers } as any;
    const fakeRes = { setHeader } as any;

    return createCookies(fakeReq, fakeRes);
}

describe('get', () => {
    it('gets a cookie', () => {
        const cookies = buildCookies({
            cookie: 'hello=there'
        });

        assert.strictEqual(cookies.get('hello'), 'there');
    });

    it('gets a specific cookie', () => {
        const cookies = buildCookies({
            cookie: 'foo=bar; hello=there; baz=qux'
        });

        assert.strictEqual(cookies.get('hello'), 'there');
    });

    it('actions malformed cookie', () => {
        const cookies = buildCookies({
            cookie: 'foo=bar;  hello=there;baz=qux;'
        });

        assert.strictEqual(cookies.get('foo'), 'bar');
        assert.strictEqual(cookies.get('hello'), 'there');
        assert.strictEqual(cookies.get('baz'), 'qux');
    });

    it('gets a funny cookie', () => {
        const cookies = buildCookies({
            cookie: 'hello=1%2B2%3D3'
        });

        assert.strictEqual(cookies.get('hello'), '1+2=3');
    });

    it('can read dumb cookies', () => {
        const cookies = buildCookies({
            cookie: 'foo; bar; hello=there; baz'
        });

        assert.strictEqual(cookies.get('foo'), '');
        assert.strictEqual(cookies.get('bar'), '');
        assert.strictEqual(cookies.get('hello'), 'there');
        assert.strictEqual(cookies.get('baz'), '');
    });

    it('does not parse an unnecessary cookie', () => {
        const cookies = buildCookies();

        assert.strictEqual(cookies.get(''), undefined);
    });
});

describe('set', () => {
    it('sets a cookie', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there');

        assert.strictEqual(cookies.get('hello'), 'there');
        assert.strictEqual(setHeader.calls.length, 1);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=there']
        ]);
    });

    it('sets a cookie with options', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there', {
            maxAge: 1000,
            domain: 'fake.domain',
            path: '/hello',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict'
        });

        assert.strictEqual(cookies.get('hello'), 'there');
        assert.strictEqual(setHeader.calls.length, 1);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=there; Max-Age=1000; Domain=fake.domain; Path=/hello; Secure; HttpOnly; SameSite=Strict']
        ]);
    });

    it('sets a funny cookie', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', '1+2=3', { maxAge: 1000 });

        assert.strictEqual(cookies.get('hello'), '1+2=3');
        assert.strictEqual(setHeader.calls.length, 1);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=1%2B2%3D3; Max-Age=1000']
        ]);
    });

    it('sets multiple cookies', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({
            cookie: 'hello=old'
        }, setHeader);

        assert.strictEqual(cookies.get('hello'), 'old');

        cookies.set('hello', 'changed', { maxAge: 1000 });
        cookies.set('foo', 'bar', { maxAge: 1000 });
        cookies.set('hello', 'there');

        assert.strictEqual(cookies.get('hello'), 'there');
        assert.strictEqual(cookies.get('foo'), 'bar');
        assert.strictEqual(setHeader.calls.length, 3);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=there', 'foo=bar; Max-Age=1000']
        ]);
    });

    it('prevents use of invalid cookie names', () => {
        const cookies = buildCookies();

        assert.throws(() => { cookies.set('hello;there', 'value'); });
        assert.throws(() => { cookies.set('hello=there', 'value'); });
        assert.throws(() => { cookies.set('hello,there', 'value'); });
        assert.throws(() => { cookies.set('hello there', 'value'); });
    });
});

describe('remove', () => {
    it('removes a cookie', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({
            cookie: 'hello=there'
        }, setHeader);

        assert.strictEqual(cookies.get('hello'), 'there');

        cookies.remove('hello');

        assert.strictEqual(cookies.get('hello'), undefined);
        assert.strictEqual(setHeader.calls.length, 1);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=; Max-Age=0']
        ]);
    });

    it('removes an added cookie', () => {
        const setHeader = util.spy();
        const cookies = buildCookies({}, setHeader);

        cookies.set('hello', 'there');

        assert.strictEqual(cookies.get('hello'), 'there');

        cookies.remove('hello');

        assert.strictEqual(cookies.get('hello'), undefined);
        assert.strictEqual(setHeader.calls.length, 2);
        assert.deepStrictEqual(setHeader.calls.pop(), [
            'Set-Cookie',
            ['hello=; Max-Age=0']
        ]);
    });
});

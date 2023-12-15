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

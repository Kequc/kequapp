import 'kequtest';
import assert from 'assert';
import { ServerResponse } from 'http';
import { getHeaderString, extendHeader, setHeaders } from '../../src/util/header-tools';

function fakeRes (headers: { [key: string]: any }): ServerResponse {
    const _headers = { ...headers };

    return {
        getHeader (key: string) {
            return _headers[key];
        },
        getHeaders () {
            return _headers;
        },
        setHeader (key: string, value: any) {
            _headers[key] = value;
        },
        removeHeader (key: string) {
            delete _headers[key];
        }
    } as unknown as ServerResponse;
}

describe('getHeaderString', () => {
    it('returns a header', () => {
        const res = fakeRes({ test: 'hi' });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, 'hi');
    });

    it('returns empty string on missing header', () => {
        const res = fakeRes({ test: 'hi' });
        const result = getHeaderString(res, 'test2');
        assert.strictEqual(result, '');
    });

    it('returns empty string on no key', () => {
        const res = fakeRes({ test: 'hi' });
        const result = getHeaderString(res);
        assert.strictEqual(result, '');
    });

    it('returns a number header', () => {
        const res = fakeRes({ test: 1 });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, '1');
    });

    it('returns an array header', () => {
        const res = fakeRes({ test: ['hello', 'hi'] });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, 'hello,hi');
    });

    it('eliminates duplicate array header values', () => {
        const res = fakeRes({ test: ['hello', 'hi', 'hello'] });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, 'hello,hi');
    });

    it('returns a string array header', () => {
        const res = fakeRes({ test: 'hello, hi' });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, 'hello,hi');
    });

    it('eliminates duplicate string array header values', () => {
        const res = fakeRes({ test: 'hello, hi, hello' });
        const result = getHeaderString(res, 'test');
        assert.strictEqual(result, 'hello,hi');
    });

    it('returns first value of no-dupe array header', () => {
        const res = fakeRes({ 'content-type': ['hello', 'hi'] });
        const result = getHeaderString(res, 'content-type');
        assert.strictEqual(result, 'hello');
    });
});

describe('extendHeader', () => {
    it('sets a header', () => {
        const res = fakeRes({ test: 'hi' });
        extendHeader(res, 'test2', 'hello');
        assert.deepStrictEqual(res.getHeaders(), {
            test: 'hi',
            test2: ['hello']
        });
    });

    it('adds to a header', () => {
        const res = fakeRes({ test: 'hi' });
        extendHeader(res, 'test', 'hello');
        assert.deepStrictEqual(res.getHeaders(), {
            test: ['hi', 'hello']
        });
    });

    it('adds to a header', () => {
        const res = fakeRes({ test: 'hi' });
        extendHeader(res, 'test', 'hello');
        assert.deepStrictEqual(res.getHeaders(), {
            test: ['hi', 'hello']
        });
    });

    it('does nothing on no value', () => {
        const res = fakeRes({ test: 'hi' });
        extendHeader(res, 'test');
        assert.deepStrictEqual(res.getHeaders(), {
            test: 'hi'
        });
    });

    it('does nothing on no key', () => {
        const res = fakeRes({ test: 'hi' });
        extendHeader(res);
        assert.deepStrictEqual(res.getHeaders(), {
            test: 'hi'
        });
    });

    it('eliminates duplicate array header values', () => {
        const res = fakeRes({ test: ['hello', 'hi', 'hello'] });
        extendHeader(res, 'test', 'hi');
        assert.deepStrictEqual(res.getHeaders(), {
            test: ['hello', 'hi']
        });
    });
});

describe('setHeaders', () => {
    it('sets headers', () => {
        const res = fakeRes({ test: ['hello', 'hi', 'hello'] });
        setHeaders(res, {
            test: 'replace',
            test2: ['hello', 'hi']
        });
        assert.deepStrictEqual(res.getHeaders(), {
            test: 'replace',
            test2: ['hello', 'hi']
        });
    });

    it('removes headers', () => {
        const res = fakeRes({ test: ['hello', 'hi', 'hello'] });
        setHeaders(res, {
            test: undefined,
            test2: ['hello', 'hi']
        });
        assert.deepStrictEqual(res.getHeaders(), {
            test2: ['hello', 'hi']
        });
    });
});

import type { IncomingMessage, ServerResponse } from 'node:http';
import Ex from '../built-in/tools/ex.ts';
import type { CookieOptions, Cookies, Params } from '../types.ts';
import type { FakeReq, FakeRes } from '../util/fake-http.ts';

export default function createCookies(
    req: Pick<IncomingMessage | FakeReq, 'headers'>,
    res: Pick<ServerResponse | FakeRes, 'setHeader'>,
): Cookies {
    const result: Params = {};
    let values: Params;

    function get(key: string): string | undefined {
        setup();
        return values[key];
    }

    function set(key: string, value: string, options?: CookieOptions): void {
        setup();
        validateCookieName(key);

        result[key] = buildAttrs(key, value, options);
        values[key] = value;
        res.setHeader('Set-Cookie', Object.values(result));
    }

    function remove(key: string): void {
        setup();
        set(key, '', { maxAge: 0 });
        delete values[key];
    }

    function setup() {
        if (values === undefined) values = parseCookieHeader(req.headers.cookie);
    }

    return { get, set, remove };
}

function buildAttrs(key: string, value: string, options?: CookieOptions) {
    const attrs = [`${key}=${encodeURIComponent(value)}`, 'Path=/'];

    if (options?.domain !== undefined) attrs.push(`Domain=${options.domain}`);
    if (options?.expires !== undefined) attrs.push(`Expires=${options.expires.toUTCString()}`);
    if (options?.maxAge !== undefined)
        attrs.push(`Max-Age=${Math.max(Math.floor(options.maxAge), 0)}`);
    if (options?.secure === true || options?.sameSite === 'None') attrs.push('Secure');
    if (options?.httpOnly) attrs.push('HttpOnly');
    if (options?.sameSite !== undefined) attrs.push(`SameSite=${options.sameSite}`);

    return attrs.join('; ');
}

function parseCookieHeader(cookie?: string): Params {
    const result: Params = {};

    if (cookie !== undefined) {
        for (const part of cookie.split(/; */)) {
            const i = part.indexOf('=');
            const key = i >= 0 ? part.slice(0, i).trim() : part.trim();
            const value = i >= 0 ? part.slice(i + 1).trim() : '';
            if (key) {
                result[key] = decodeURIComponent(value);
            }
        }
    }

    return result;
}

function validateCookieName(name: string): void {
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) {
        throw Ex.InternalServerError(`Cookie name contains invalid characters: ${name}`);
    }
}

import { IncomingMessage, ServerResponse } from 'http';
import { TCookieOptions, TCookies, TParams } from '../types';
import Ex from '../built-in/tools/ex';

export default function createCookies (req: IncomingMessage, res: ServerResponse): TCookies {
    const result: TParams = {};
    const values: TParams = parseCookieHeader(req.headers.cookie);

    function get (key: string): string | undefined {
        return values[key];
    }

    function set (key: string, value: string, options?: TCookieOptions): void {
        validateCookieName(key);
        const attrs = [`${key}=${encodeURIComponent(value)}`];

        if (options) {
            if (options.expires !== undefined) attrs.push(`Expires=${formatExpires(options.expires)}`);
            if (options.maxAge !== undefined) attrs.push(`Max-Age=${options.maxAge}`);
            if (options.domain !== undefined) attrs.push(`Domain=${options.domain}`);
            if (options.path !== undefined) attrs.push(`Path=${options.path}`);
            if (options.secure) attrs.push('Secure');
            if (options.httpOnly) attrs.push('HttpOnly');
            if (options.partitioned) attrs.push('Partitioned');
            if (options.sameSite !== undefined) attrs.push(`SameSite=${options.sameSite}`);
        }

        result[key] = attrs.join('; ');
        values[key] = value;
        res.setHeader('Set-Cookie', Object.values(result));
    }

    function remove (key: string): void {
        set(key, '', { maxAge: 0 });
        delete values[key];
    }

    return { get, set, remove };
}

function parseCookieHeader (cookie?: string): TParams {
    const result: TParams = {};

    if (cookie !== undefined) {
        for (const part of cookie.split('; ')) {
            const [key, value] = part.split('=');
            result[key] = decodeURIComponent(value ?? '');
        }
    }

    return result;
}

function validateCookieName (name: string): void {
    if (name.includes(';')) throw Ex.InternalServerError(`Cookie name "${name}" contains invalid character ";"`);
    if (name.includes('=')) throw Ex.InternalServerError(`Cookie name "${name}" contains invalid character "="`);
    if (name.includes(',')) throw Ex.InternalServerError(`Cookie name "${name}" contains invalid character ","`);
    if (name.includes(' ')) throw Ex.InternalServerError(`Cookie name "${name}" contains invalid character " "`);
}

function formatExpires (expires: Date | string): string {
    if (expires instanceof Date) return expires.toUTCString();
    return expires;
}

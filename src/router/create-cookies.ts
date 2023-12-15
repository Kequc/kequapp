import { IncomingMessage, ServerResponse } from 'http';
import { TCookieOptions, TCookies } from '../types';

export default function createCookies (req: IncomingMessage, res: ServerResponse): TCookies {
    const result: { [key: string]: string } = {};
    const values: { [key: string]: string | undefined } = {};

    function get (key: string): string | undefined {
        if (Object.prototype.hasOwnProperty.call(values, key)) return values[key];

        const cookies = req.headers.cookie?.split('; ') ?? [];
        const cookie = cookies.find(cookie => cookie.startsWith(`${key}=`));

        if (!cookie) return undefined;

        return cookie.slice(cookie.indexOf('=') + 1);
    }

    function set (key: string, value: string, options?: TCookieOptions): void {
        const attrs = [`${key}=${value}`];

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
        values[key] = undefined;
    }

    return { get, set, remove };
}

function formatExpires (expires: Date | string): string {
    if (expires instanceof Date) return expires.toUTCString();
    return expires;
}

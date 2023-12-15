import { IncomingMessage, ServerResponse } from 'http';
import { TCookieOptions, TCookies } from '../types';

export default function createCookies (req: IncomingMessage, res: ServerResponse): TCookies {
    function get (key: string): string | undefined {
        const cookies = req.headers.cookie?.split('; ') ?? [];
        const cookie = cookies.find(cookie => cookie.startsWith(`${key}=`));

        return cookie?.split('=')[1];
    }

    function set (key: string, value: string, options?: TCookieOptions): void {
        const attrs = [`${key}=${value}`];

        if (options) {
            if (options.expires) attrs.push(`Expires=${formatExpires(options.expires)}`);
            if (options.maxAge) attrs.push(`Max-Age=${options.maxAge}`);
            if (options.domain) attrs.push(`Domain=${options.domain}`);
            if (options.path) attrs.push(`Path=${options.path}`);
            if (options.secure) attrs.push('Secure');
            if (options.httpOnly) attrs.push('HttpOnly');
            if (options.partitioned) attrs.push('Partitioned');
            if (options.sameSite) attrs.push(`SameSite=${options.sameSite}`);
        }

        res.setHeader('Set-Cookie', attrs.join('; '));
    }

    function remove (key: string): void {
        set(key, '', { maxAge: 0 });
    }

    return { get, set, remove };
}

function formatExpires (expires: Date | string): string {
    if (expires instanceof Date) return expires.toUTCString();
    return expires;
}

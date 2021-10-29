import { IncomingMessage, ServerResponse } from 'http';

export function sanitizePathname (pathname = ''): string {
    const result = pathname.replace(/[\\/]+$/, '');
    if (result[0] !== '/') {
        return '/' + result;
    }
    return result;
}

export function sanitizeContentType (contentType = ''): string {
    return contentType.split(';')[0].toLowerCase().trim() || 'text/plain';
}

export function getHeader (stream: IncomingMessage | ServerResponse, name: string): string {
    if ('getHeader' in stream) {
        return String(stream.getHeader(name) || '').trim();
    } else if ('headers' in stream) {
        return String(stream.headers[name.toLowerCase()] || '').trim();
    }
    return '';
}

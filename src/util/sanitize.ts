export function sanitizePathname (pathname = ''): string {
    const result = pathname.replace(/[\\/]+$/, '');

    if (result[0] !== '/') {
        return `/${result}`;
    }

    return result;
}

export function sanitizeContentType (contentType: string): string {
    return contentType.split(';')[0].toLowerCase().trim() || 'text/plain';
}

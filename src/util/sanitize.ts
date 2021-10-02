export function sanitizePathname (pathname = '') {
    const result = pathname.replace(/[\\/]+$/, '');
    if (result[0] !== '/') {
        return '/' + result;
    }
    return result;
}

export function sanitizeContentType (contentType = '') {
    return contentType.split(';')[0].toLowerCase().trim();
}

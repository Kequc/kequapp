export function sanitizePathname (pathname = ''): string {
    const result = pathname.replace(/[\\/]+$/, '');
    if (result[0] !== '/') {
        return '/' + result;
    }
    return result;
}

export function sanitizeContentType (contentType = ''): string {
    return contentType.split(';')[0].toLowerCase().trim();
}


export function headerAttributes (header = ''): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    const parts = header.split('='); // format a=b or a="b"

    if (parts.length == 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        try {
            result[key] = JSON.parse(value); // "b"
        } catch (error) {
            result[key] = value;
        }
    }

    return result;
}

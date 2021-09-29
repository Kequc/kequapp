function sanitizeContentType (rawContentType = '') {
    return rawContentType.toLowerCase().split(';')[0];
}

function sanitizePathname (pathname = '') {
    const result = pathname.replace(/[\\/]+$/, '');
    if (result[0] !== '/') {
        return '/' + result;
    }
    return result;
}

module.exports = {
    sanitizeContentType,
    sanitizePathname
};

const errors = require('./util/errors.js');

function findRoute (routes, method, pathname) {
    // exactly the route
    let result = routes.find(routeMatch(method, pathname));

    // maybe it's a head request
    if (!result && method === 'HEAD') {
        result = routes.find(routeMatch('GET', pathname));
    }

    if (!result) {
        throw errors.NotFound(`Not Found: ${pathname}`, {
            request: { method, pathname },
            routes: [...routes].sort(routeSorter).map(formatRoute)
        });
    }

    return result;
}

module.exports = findRoute;

function routeMatch (method, pathname) {
    return function (route) {
        if (route.method !== method) {
            return false;
        }
        return comparePathnames(route.pathname, pathname);
    };
}

function comparePathnames (srcPathname, reqPathname) {
    const srcParts = srcPathname.split('/').filter(part => !!part);
    const reqParts = reqPathname.split('/').filter(part => !!part);
    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i] === '**') return true;
        if (srcParts[i] === '*') continue;
        if (srcParts[i].startsWith(':')) continue;
        if (srcParts[i] === reqParts[i]) continue;
        return false;
    }
    return srcParts.length === reqParts.length;
}

function routeSorter (a, b) {
    return (a.pathname + a.method).localeCompare(b.pathname + b.method);
}

function formatRoute ({ method, pathname }) {
    return `${method} ${pathname}`;
}

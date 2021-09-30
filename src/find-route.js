function findRoute (routes, { req, pathname, errors }) {
    let result = routes.find(routeMatch(req.method, pathname));

    if (!result && req.method === 'HEAD') {
        result = routes.find(routeMatch('GET', pathname));
    }

    if (!result) {
        throw errors.NotFound(`Not Found: ${pathname}`, {
            request: { method: req.method, pathname },
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
    if (srcParts.length !== reqParts.length) return false;
    for (let i = 0; i < srcParts.length; i++) {
        if (srcParts[i].startsWith(':')) continue;
        if (srcParts[i] === reqParts[i]) continue;
        return false;
    }
    return true;
}

function routeSorter (a, b) {
    return (a.pathname + a.method).localeCompare(b.pathname + b.method);
}

function formatRoute ({ method, pathname }) {
    return `${method} ${pathname}`;
}

function findRoute (rL, { method, pathname, errors }) {
  const result = rL._routes.find(routeMatch(method, pathname));

  if (!result) {
    throw errors.NotFound(`Not Found: ${pathname}`, {
      request: { method, pathname },
      routes: rL._routes.map(formatRoute)
    });
  }

  return result;
}

module.exports = findRoute;

function routeMatch (method, pathname) {
  return function (route) {
    if (!route.methods.includes(method)) {
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

function formatRoute (route) {
  const methods = `[${route.methods.join(',')}]`;
  return `${methods} ${route.pathname}`;
}

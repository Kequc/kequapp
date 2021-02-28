function findRoute (rL, { method, pathname }) {
  const result = rL._routes.find(routeMatch(pathname, method));

  if (!result) {
    throw rL.errors.NotFound(`Not Found: ${pathname}`, {
      request: { method, pathname },
      routes: rL._routes.map(formatRoute)
    });
  }

  return result;
}

module.exports = findRoute;

function routeMatch (pathname, method) {
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
  const methods = `[${route.methods.join(', ')}]`;
  return `${methods} ${route.pathname}`;
}

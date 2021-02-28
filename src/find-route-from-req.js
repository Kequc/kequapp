const { URL } = require('url');

function findRouteFromReq (rL, req) {
  const { method } = req;
  const { pathname } = new URL(req.url);

  const result = rL._routes.find(routeMatch(pathname, method));

  return result || null;
}

module.exports = findRouteFromReq;

function routeMatch (pathname, method) {
  return function (route) {
    if (!route.methods.includes(method)) {
      return false;
    }
    return comparePathnames(route.pathname, pathname);
  };
}

function comparePathnames (srcPathname, reqPathname) {
  const srcParts = srcPathname.split('/');
  const reqParts = reqPathname.split('/');
  if (srcParts.length !== reqParts.length) return false;
  for (let i = 0; i < srcParts.length; i++) {
    if (srcParts[i].startsWith(':')) continue;
    if (srcParts[i] === reqParts[i]) continue;
  }
  return true;
}

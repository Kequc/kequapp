const path = require('path');
const { sanitizePathname } = require('./util/sanitize.js');

function buildMethodScope (rL, parent) {
  const scope = {};
  scope.route = buildRoute(rL, parent, scope);
  scope.branch = buildBranch(rL, parent);
  scope.middleware = buildMiddleware(parent, scope);
  return scope;
}

module.exports = buildMethodScope;

function buildBranch (rL, parent) {
  return function branch (...handles) {
    const pathname = extractPathname(handles);
    const newParent = branchMerge(parent, {
      pathname,
      handles
    });

    return buildMethodScope(rL, newParent);
  };
}

function buildMiddleware (parent, scope) {
  return function middleware (...handles) {
    const pathname = extractPathname(handles);

    Object.assign(parent, branchMerge(parent, {
      pathname,
      handles
    }));

    return scope;
  };
}

function buildRoute (rL, parent, scope) {
  return function route (...handles) {
    const method = extractMethod(handles);
    const pathname = extractPathname(handles);

    const route = branchMerge(parent, {
      pathname,
      handles
    }, {
      method
    });

    rL._routes.push(route);

    return scope;
  };
}

function extractMethod (handles) {
  if (typeof handles[0] !== 'string' || handles[0][0] === '/') {
    return 'GET';
  }
  return handles.shift().toUpperCase();
}

function extractPathname (handles) {
  if (typeof handles[0] !== 'string' || handles[0][0] !== '/') {
    return '/';
  }
  return handles.shift();
}

function branchMerge (parent, child, more = {}) {
  const newPathname = path.join(parent.pathname, child.pathname);
  const newHandles = parent.handles.concat(child.handles);

  return Object.assign({
    pathname: sanitizePathname(newPathname),
    handles: sanitizeHandles(newHandles)
  }, more);
}

function sanitizeHandles (handles) {
  return handles.flat().filter(handle => typeof handle === 'function');
}

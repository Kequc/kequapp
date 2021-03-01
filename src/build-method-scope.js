const path = require('path');
const errors = require('./errors.js');
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
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';

    const newParent = branchMerge(parent, {
      pathname,
      handles
    });

    return buildMethodScope(rL, newParent);
  };
}

function buildMiddleware (parent, scope) {
  return function middleware (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';

    Object.assign(parent, branchMerge(parent, {
      pathname,
      handles
    }));

    return scope;
  };
}

function buildRoute (rL, parent, scope) {
  return function route (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';
    const methods = handles.shift();

    if (!Array.isArray(methods) || methods.findIndex(method => typeof method !== 'string') >= 0) {
      throw errors.InternalServerError('Invalid methods format', { methods });
    }

    const route = branchMerge(parent, {
      pathname,
      handles
    }, {
      methods: methods.map(method => method.toLowerCase())
    });

    rL._routes.push(route);

    return scope;
  };
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

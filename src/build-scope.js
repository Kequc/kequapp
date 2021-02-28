const path = require('path');
const { sanitizeHandles, sanitizePathname } = require('./util/sanitize.js');

function buildScope (rL, parent) {
  const scope = {};
  scope.branch = buildBranch(rL, parent);
  scope.use = buildUse(rL, parent, scope);
  scope.route = buildRoute(rL, parent, scope);
  return scope;
}

module.exports = buildScope;

function buildBranch (rL, parent) {
  return function branch (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';

    // TODO validate

    const newParent = branchMerge(parent, {
      pathname,
      handles
    });

    return buildScope(rL, newParent);
  };
}

function buildUse (rL, parent, scope) {
  return function use (...handles) {
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
      throw rL.errors.InternalServerError('Invalid methods format', { methods });
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
  return Object.assign({
    pathname: sanitizePathname(path.join(parent.pathname, child.pathname)),
    handles: parent.handles.concat(sanitizeHandles(child.handles))
  }, more);
}

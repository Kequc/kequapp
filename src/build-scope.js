const path = require('path');

function buildScope (rL, parent) {
  return {
    branch: buildBranch(rL, parent),
    route: buildRoute(rL, parent)
  };
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

function buildRoute (rL, parent) {
  return function route (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';
    const methods = handles.shift();

    // TODO validate

    const route = branchMerge(parent, {
      pathname,
      handles
    }, {
      methods
    });

    rL._routes.push(route);

    return parent;
  };
}

function branchMerge (parent, child, more = {}) {
  return Object.assign({
    pathname: path.join(parent.pathname, child.pathname),
    handles: parent.handles.concat(sanitizeHandles(child.handles))
  }, more);
}

function sanitizeHandles (handles) {
  return handles.flat().filter(handle => typeof handle === 'function');
}

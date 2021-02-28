const path = require('path');

function buildScope (rL, parent) {
  return {
    trail: buildTrail(rL, parent),
    route: buildRoute(rL, parent)
  };
}

module.exports = buildScope;

function buildTrail (rL, parent) {
  function trail (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';

    // TODO validate

    const newParent = mergeWith(parent, {
      pathname,
      handles
    });

    return buildScope(rL, newParent);
  }

  return trail;
}

function buildRoute (rL, parent) {
  function route (...handles) {
    const pathname = typeof handles[0] === 'string' ? handles.shift() : '/';
    const methods = handles.pop();

    // TODO validate

    const route = mergeWith(parent, {
      pathname,
      handles
    }, {
      methods
    });

    rL.routes.push(route);
  }

  return route;
}

function mergeWith (parent, child, more = {}) {
  return Object.assign({
    pathname: path.join(parent.pathname, child.pathname),
    handles: parent.handles.concat(sanitizeHandles(child.handles))
  }, more);
}

function sanitizeHandles (handles) {
  return handles.flat().filter(handle => typeof handle === 'function');
}

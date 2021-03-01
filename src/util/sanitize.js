const { URL } = require('url');

function sanitizeHandles (handles) {
  return handles.flat().filter(handle => typeof handle === 'function');
}

function getPathnameFromReq (req) {
  return sanitizePathname(new URL(req.url, `http://${req.headers.host}`).pathname);
}

function sanitizePathname (pathname) {
  const result = pathname.replace(/[\\/]+$/, '');
  if (result[0] !== '/') {
    return '/' + result;
  }
  return result;
}

module.exports = {
  sanitizeHandles,
  getPathnameFromReq,
  sanitizePathname
};

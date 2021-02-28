function sanitizeHandles (handles) {
  return handles.flat().filter(handle => typeof handle === 'function');
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
  sanitizePathname
};

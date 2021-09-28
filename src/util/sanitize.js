function sanitizePathname (pathname) {
  const result = pathname.replace(/[\\/]+$/, '');
  if (result[0] !== '/') {
    return '/' + result;
  }
  return result;
}

function extractContentType (rawContentType = '') {
  return rawContentType.split(';')[0];
}

module.exports = {
  sanitizePathname,
  extractContentType
};

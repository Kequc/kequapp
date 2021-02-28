const { InternalServerError } = require('./create-error.js');
const { URL } = require('url');

async function execute (route, req, res) {
  let context = {};
  let result;

  res.setHeader('content-type', 'text/plain');

  const { pathname, searchParams } = new URL(req.url);
  const params = extractParams(route.pathname, pathname);
  const query = Object.fromEntries(searchParams);

  for (const handler of route.handlers) {
    // construct context from middleware

    if (result) {
      if (typeof result !== 'object') {
        throw InternalServerError('Unexpected middleware result', { type: typeof result, result });
      }
      context = Object.assign({}, context, result);
    }

    result = await handler({
      req,
      res,
      context,
      params,
      query
    });
  }

  return { result, context };
}

module.exports = execute;

function extractParams (srcPathname, reqPathname) {
  const params = {};
  const srcParts = srcPathname.split('/');
  const reqParts = reqPathname.split('/');
  for (let i = 0; i < srcParts.length; i++) {
    if (srcParts[i].startsWith(':')) {
      params[srcParts[i].substr(1)] = reqParts[i];
    }
  }
  return params;
}

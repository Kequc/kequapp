const { URL } = require('url');
const parseBody = require('./util/parse-body.js');

async function execute (rL, route, req, res) {
  let context = {};
  let result;

  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const params = extractParams(route.pathname, pathname);
  const query = Object.fromEntries(searchParams);
  const body = await parseBody(rL, req);

  for (const handle of route.handles) {
    // construct context from middleware

    if (result) {
      if (typeof result !== 'object') {
        throw rL.errors.InternalServerError('Unexpected middleware result', { type: typeof result, result });
      }
      context = Object.assign({}, context, result);
    }

    result = await handle({
      req,
      res,
      context,
      params,
      query,
      body
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

const { URL } = require('url');
const parseBody = require('./util/parse-body.js');

async function execute (rL, route, req, res, pathname) {
  let context = {};
  let payload;

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const params = extractParams(route.pathname, pathname);
  const query = Object.fromEntries(searchParams);
  const body = await parseBody(rL, req);

  for (const handle of route.handles) {
    // construct context from middleware

    if (payload) {
      if (typeof payload !== 'object') {
        throw rL.errors.InternalServerError('Unexpected middleware result', { type: typeof payload, payload });
      }
      context = Object.assign({}, context, payload);
    }

    payload = await handle({
      rL,
      req,
      res,
      context,
      params,
      query,
      body
    });
  }

  return { payload, context };
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

const parseBody = require('./parse-body.js');

async function execute (rL, route, bundle) {
  const params = extractParams(route.pathname, bundle.pathname);
  let _body;

  bundle.res.setHeader('Content-Type', 'text/plain; charset=utf-8'); // default

  async function getBody () {
    if (_body === undefined) {
      _body = await parseBody(rL, bundle);
    }
    return _body;
  }

  Object.assign(bundle, {
    params,
    context: {},
    getBody
  });

  for (const handle of route.handles) {
    const payload = await handle(bundle);

    if (payload !== undefined || bundle.res.writableEnded) {
      return payload;
    }
  }
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

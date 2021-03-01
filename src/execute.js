const parseBody = require('./parse-body.js');
const errors = require('./errors.js');

async function execute (rL, route, bundle) {
  const context = {};
  let payload;

  const params = extractParams(route.pathname, bundle.pathname);
  const body = await parseBody(rL, bundle);

  Object.assign(bundle, {
    params,
    body,
    context
  });

  for (const handle of route.handles) {
    // construct context from middleware

    if (payload) {
      if (typeof previousResult !== 'object') {
        throw errors.InternalServerError('Unexpected middleware result', { type: typeof payload, payload });
      }
      Object.assign(context, payload);
    }

    payload = await handle(bundle);
  }

  return payload;
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

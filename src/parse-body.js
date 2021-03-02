const querystring = require('querystring');
const streamReader = require('./util/stream-reader.js');

async function parseBody (rL, { req }) {
  const { maxPayloadSize } = rL._opt;
  const contentType = req.headers['content-type'];

  const result = await streamReader(req, maxPayloadSize);

  if (contentType === 'application/x-www-form-urlencoded') {
    return querystring.parse(result);
  } else if (contentType === 'application/json') {
    return JSON.parse(result);
  } else {
    return result;
  }
}

module.exports = parseBody;

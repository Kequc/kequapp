const streamReader = require('./util/stream-reader.js');

async function parseBody (rL, { req }) {
  const { maxPayloadSize } = rL._opt;
  const contentType = req.getHeader('content-type');

  return await streamReader(req, contentType, maxPayloadSize);
}

module.exports = parseBody;

const NODE_ENV = process.env.NODE_ENV || 'development';

function jsonRenderer (payload, { method, res, errors }) {
  try {
    const json = generateJson(payload);

    res.setHeader('Content-Length', json.length);

    if (method === 'HEAD') {
      res.end();
    } else {
      res.end(json);
    }
  } catch (error) {
    throw errors.InternalServerError('Invalid json response', { payload, error });
  }
}

module.exports = jsonRenderer;

function generateJson (payload) {
  if (NODE_ENV === 'production') {
    return JSON.stringify(payload);
  }

  return JSON.stringify(payload, null, 2);
}

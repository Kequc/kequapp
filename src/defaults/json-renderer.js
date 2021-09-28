const NODE_ENV = process.env.NODE_ENV || 'development';

function jsonRenderer (payload, { method, res, errors }) {
  const json = generateJson(payload, errors);

  res.setHeader('Content-Length', json.length);

  if (method === 'HEAD') {
    res.end();
  } else {
    res.end(json);
  }
}

module.exports = jsonRenderer;

function generateJson (payload, errors) {
  try {
    if (NODE_ENV === 'production') {
      return JSON.stringify(payload);
    } else {
      return JSON.stringify(payload, null, 2);
    }
  } catch (error) {
    throw errors.InternalServerError('Invalid json response', { payload, error });
  }
}

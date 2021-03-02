const NODE_ENV = process.env.NODE_ENV || 'development';

function jsonRenderer (payload, { res, errors }) {
  try {
    if (NODE_ENV !== 'production') {
      res.end(JSON.stringify(payload, null, 2));
    } else {
      res.end(JSON.stringify(payload));
    }
  } catch (error) {
    console.log(error);
    throw errors.InternalServerError('Invalid json response', { payload, error });
  }
}

module.exports = jsonRenderer;

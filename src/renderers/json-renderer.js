const NODE_ENV = process.env.NODE_ENV || 'development';

function jsonRenderer ({ rL, payload, res }) {
  try {
    if (NODE_ENV !== 'production') {
      res.end(JSON.stringify(payload, null, 2));
    } else {
      res.end(JSON.stringify(payload));
    }
  } catch (error) {
    throw rL.errors.InternalServerError('Invalid json response', { payload, error });
  }
}

module.exports = jsonRenderer;

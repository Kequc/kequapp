const { InternalServerError } = require('../create-error.js');

function jsonRenderer (payload, res) {
  try {
    if (process.env.NODE_ENV === 'development') {
      res.end(JSON.stringify(payload, null, 2));
    } else {
      res.end(JSON.stringify(payload));
    }
  } catch (error) {
    throw InternalServerError('Invalid json response', { payload, error });
  }
}

module.exports = jsonRenderer;

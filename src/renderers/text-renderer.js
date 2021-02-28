const { InternalServerError } = require('../create-error.js');

function textRenderer (payload, res) {
  if (typeof payload === 'string') {
    res.end(payload);
  } else {
    throw InternalServerError('Invalid string response', { type: typeof payload, payload });
  }
}

module.exports = textRenderer;

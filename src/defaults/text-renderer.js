function textRenderer (payload, { res, errors }) {
  try {
    res.end(String(payload));
  } catch (error) {
    throw errors.InternalServerError('Invalid text response', { payload, error });
  }
}

module.exports = textRenderer;

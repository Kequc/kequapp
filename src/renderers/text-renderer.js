function textRenderer (rL, payload, res) {
  try {
    res.end(String(payload));
  } catch (error) {
    throw rL.errors.InternalServerError('Invalid text response', { payload, error });
  }
}

module.exports = textRenderer;

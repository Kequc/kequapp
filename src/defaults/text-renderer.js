function textRenderer (payload, { method, res, errors }) {
  try {
    const text = generateText(payload);

    res.setHeader('Content-Length', text.length);

    if (method === 'HEAD') {
      res.end();
    } else {
      res.end(text);
    }
  } catch (error) {
    throw errors.InternalServerError('Invalid text response', { payload, error });
  }
}

module.exports = textRenderer;

function generateText (payload) {
  return String(payload);
}

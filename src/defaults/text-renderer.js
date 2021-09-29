function textRenderer (payload, { req, res, errors }) {
    const text = generateText(payload, errors);

    res.setHeader('Content-Length', text.length);

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(text);
    }
}

module.exports = textRenderer;

function generateText (payload, errors) {
    try {
        return String(payload);
    } catch (error) {
        throw errors.InternalServerError('Invalid text response', { payload, error });
    }
}

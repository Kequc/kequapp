import { ServerBundle } from 'index';
import { ErrorsHelper } from 'util/errors';

function textRenderer (payload: any, { req, res, errors }: ServerBundle) {
    const text = generateText(payload, errors);

    res.setHeader('Content-Length', text.length);

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(text);
    }
}

export default textRenderer;

function generateText (payload: any, errors: ErrorsHelper) {
    try {
        return String(payload);
    } catch (error) {
        throw errors.InternalServerError('Invalid text response', { payload, error });
    }
}

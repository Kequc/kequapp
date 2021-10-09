import { ErrorsHelper } from '../../types/errors';
import { Bundle } from '../../types/main';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function textRenderer (payload: any, { req, res, errors }: Bundle): void {
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

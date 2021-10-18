import Ex from '../util/ex';

import { Bundle } from '../../types/main';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function textRenderer (payload: any, { req, res }: Bundle): void {
    const text = generateText(payload);

    res.setHeader('Content-Length', text.length);

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(text);
    }
}

export default textRenderer;

function generateText (payload: any) {
    try {
        return String(payload);
    } catch (error) {
        throw Ex.InternalServerError('Invalid text response', { payload, error });
    }
}

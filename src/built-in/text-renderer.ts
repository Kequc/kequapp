import { Bundle } from '../main';
import Ex from '../utils/ex';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function textRenderer (payload: unknown, { req, res }: Bundle): void {
    const text = generateText(payload);

    res.setHeader('Content-Length', Buffer.byteLength(text));

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(text);
    }
}

export default textRenderer;

function generateText (payload: unknown): string {
    try {
        return String(payload);
    } catch (error) {
        throw Ex.InternalServerError('Invalid text response', { payload, error });
    }
}

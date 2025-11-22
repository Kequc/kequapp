import { Ex } from '../built-in/tools/ex.ts';
import { createRenderer } from '../router/modules.ts';

export const textRenderer = createRenderer({
    contentType: 'text/*',
    action(payload, { req, res }) {
        const text = generateText(payload);

        res.setHeader('Content-Length', Buffer.byteLength(text));

        if (req.method === 'HEAD') {
            res.end();
        } else {
            res.end(text);
        }
    },
});

function generateText(payload: unknown): string {
    try {
        return String(payload);
    } catch (error) {
        throw Ex.InternalServerError('Invalid text response', {
            payload,
            error,
        });
    }
}

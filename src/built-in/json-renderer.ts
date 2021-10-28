import { Bundle } from '../main';
import Ex from '../utils/ex';

const NODE_ENV = process.env.NODE_ENV || 'development';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function jsonRenderer (payload: unknown, { req, res }: Bundle): void {
    const json = generateJson(payload);

    res.setHeader('Content-Length', json.length);

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(json);
    }
}

export default jsonRenderer;

function generateJson (payload: unknown): string {
    try {
        if (NODE_ENV === 'production') {
            return JSON.stringify(payload);
        } else {
            return JSON.stringify(payload, null, 2);
        }
    } catch (error) {
        throw Ex.InternalServerError('Invalid json response', { payload, error });
    }
}

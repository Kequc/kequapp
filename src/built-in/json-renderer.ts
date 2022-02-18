import Ex from '../util/ex';

function jsonRenderer (payload: unknown, { req, res }: TBundle): void {
    const json = generateJson(payload);

    res.setHeader('Content-Length', Buffer.byteLength(json));

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(json);
    }
}

export default jsonRenderer;

function generateJson (payload: unknown): string {
    try {
        if (process.env.NODE_ENV === 'production') {
            return JSON.stringify(payload);
        } else {
            return JSON.stringify(payload, null, 2);
        }
    } catch (error) {
        throw Ex.InternalServerError('Invalid json response', { payload, error });
    }
}

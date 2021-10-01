import { ServerBundle } from 'index';
import { ErrorsHelper } from 'util/errors';

const NODE_ENV = process.env.NODE_ENV || 'development';

function jsonRenderer (payload: any, { req, res, errors }: ServerBundle) {
    const json = generateJson(payload, errors);

    res.setHeader('Content-Length', json.length);

    if (req.method === 'HEAD') {
        res.end();
    } else {
        res.end(json);
    }
}

export default jsonRenderer;

function generateJson (payload: any, errors: ErrorsHelper) {
    try {
        if (NODE_ENV === 'production') {
            return JSON.stringify(payload);
        } else {
            return JSON.stringify(payload, null, 2);
        }
    } catch (error) {
        throw errors.InternalServerError('Invalid json response', { payload, error });
    }
}

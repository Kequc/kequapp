import { BodyJson } from '../body/get-body';
import { ServerError } from '../util/ex';
import { Bundle } from '../main';

const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler (error: ServerError, { res }: Bundle): BodyJson {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const result = {
        error: {
            statusCode,
            message: error.message,
            stack: undefined as any,
            info: undefined as any
        }
    };

    if (NODE_ENV !== 'production') {
        result.error.stack = error.stack?.split(/\r?\n/);
        result.error.info = error.info;
    }

    return result;
}

export default errorHandler;

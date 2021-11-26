import { BodyJson } from '../body/create-get-body';
import { Bundle } from '../main';
import { ServerError } from '../utils/ex';

function errorHandler (error: unknown, { res }: Bundle): BodyJson {
    const _error = error as ServerError;
    const statusCode = _error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');

    const result = {
        error: {
            statusCode,
            message: _error.message,
            stack: undefined as any,
            info: undefined as any
        }
    };

    if (process.env.NODE_ENV !== 'production') {
        result.error.stack = _error.stack?.split(/\r?\n/);
        result.error.info = _error.info;
    }

    return result;
}

export default errorHandler;

import { BodyJson } from '../body/create-get-body';
import { Bundle } from '../main';
import { ServerError } from '../utils/ex';

const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler (error: unknown, { res, logger }: Bundle): BodyJson {
    const _error = error as ServerError;
    const statusCode = _error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const result = {
        error: {
            statusCode,
            message: _error.message,
            stack: undefined as any,
            info: undefined as any
        }
    };

    if (NODE_ENV !== 'production') {
        result.error.stack = _error.stack?.split(/\r?\n/);
        result.error.info = _error.info;
    }

    if (statusCode === 500) {
        logger.error(error);
    }

    return result;
}

export default errorHandler;

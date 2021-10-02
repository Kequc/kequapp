import { ServerError } from '../../types/errors';
import { Bundle } from '../../types/main';

const NODE_ENV = process.env.NODE_ENV || 'development';

type ErrorResult = {
    error: {
        statusCode: number,
        message: string,
        stack?: any,
        info?: any
    }
};

function errorHandler (error: ServerError, { res }: Bundle) {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const result: ErrorResult = {
        error: {
            statusCode,
            message: error.message
        }
    };

    if (NODE_ENV !== 'production') {
        result.error.stack = error.stack?.split(/\r?\n/);
        result.error.info = error.info;
    }

    return result;
}

export default errorHandler;

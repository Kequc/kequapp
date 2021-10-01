import { ServerBundle } from "index";

const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler (error: ServerError, { res }: ServerBundle) {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const result: DataObject = {
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

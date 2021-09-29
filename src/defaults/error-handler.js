const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler (error, { res }) {
    const statusCode = error.statusCode || 500;

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const result = {
        error: {
            statusCode,
            message: error.message
        }
    };

    if (NODE_ENV !== 'production') {
        result.error.stack = error.stack.split(/\r?\n/);
        result.error.info = error.info;
    }

    return result;
}

module.exports = errorHandler;

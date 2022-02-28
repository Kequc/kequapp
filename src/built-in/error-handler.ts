import createErrorHandler from '../addable/create-error-handler';

export default createErrorHandler((error, { res }) => {
    const _error = error as TServerError;
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
});

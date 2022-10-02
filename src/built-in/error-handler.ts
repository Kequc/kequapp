import createErrorHandler from '../router/modules/create-error-handler';

type TErrorResponse = {
    statusCode: number;
    message: string;
    stack?: string[];
    info?: unknown[];
};

export default createErrorHandler((ex, { res }) => {
    const error: TErrorResponse = {
        statusCode: ex.statusCode,
        message: ex.message
    };

    if (process.env.NODE_ENV !== 'production') {
        error.stack = ex.stack?.split(/\r?\n/);
        error.info = ex.info;
    }

    res.setHeader('Content-Type', 'application/json');

    return { error };
});

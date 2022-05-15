import createErrorHandler from '../router/modules/create-error-handler';
import { TServerEx } from '../types';

export default createErrorHandler((ex, { res }) => {
    const error = generateError(ex as TServerEx);

    res.statusCode = error.statusCode;
    res.setHeader('Content-Type', 'application/json');

    return { error };
});

function generateError (ex: TServerEx) {
    const error: {
        statusCode: number;
        message: string;
        stack?: string[];
        info?: unknown[];
    } = {
        statusCode: 500,
        message: 'Internal Server Error'
    };

    if (ex instanceof Error) {
        error.statusCode = ex.statusCode || 500;
        error.message = ex.message;

        if (process.env.NODE_ENV !== 'production') {
            error.stack = ex.stack?.split(/\r?\n/);
            error.info = ex.info;
        }
    }

    return error;
}

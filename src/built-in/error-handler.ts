import { createErrorHandler } from '../router/modules.ts';

interface TErrorResponse {
    statusCode: number;
    message: string;
    cause?: unknown;
    stack?: string[];
    info?: Record<string, unknown>;
}

export const errorHandler = createErrorHandler({
    contentType: '*',
    action(ex, { res }) {
        const error: TErrorResponse = {
            statusCode: ex.statusCode,
            message: ex.message,
            cause: ex.cause,
        };

        if (process.env.NODE_ENV !== 'production') {
            error.stack = ex.stack?.split(/\r?\n/);
            error.info = ex.info;
        }

        res.setHeader('Content-Type', 'application/json');

        return { error };
    },
});

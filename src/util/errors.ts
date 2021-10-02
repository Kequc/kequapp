import { STATUS_CODES } from 'http';

import { ErrorsHelper, ServerError } from '../../types/errors';

const statusCodes = Object.keys(STATUS_CODES).map(statusCode => parseInt(statusCode, 10));
const errors: any = {
    StatusCode,
};

function StatusCode (statusCode: number, message?: string, ...info: any[]) {
    if (!STATUS_CODES[statusCode]) {
        return _buildError(StatusCode, 500, message, ...info);
    }
    return _buildError(StatusCode, statusCode, message, ...info);
}

for (const statusCode of statusCodes) {
    if (statusCode < 400) continue;
    const key = createMethodName(statusCode);
    errors[key] = function (message?: string, ...info: any[]) {
        return _buildError(errors[key], statusCode, message, ...info);
    };
}

export default errors as ErrorsHelper;

function _buildError (parent: Function, statusCode: number, message?: string, ...info: any[]) {
    const error = new Error(message || STATUS_CODES[statusCode]) as ServerError;
    error.statusCode = statusCode;
    error.info = info.map(normalize);
    Error.captureStackTrace(error, parent);
    return error;
}

function createMethodName (statusCode: number) {
    const message = STATUS_CODES[statusCode]!;
    return message.replace('\'', '').split(/[\s-]+/).map(word => word.charAt(0).toUpperCase() + word.substr(1)).join('');
}

function normalize (value: any) {
    if (typeof value !== 'object' || value === null) return value;
    if (value instanceof Date) return value;
    if (value instanceof Error) return {
        message: value.message,
        name: value.name,
        stack: value.stack?.split(/\r?\n/)
    };
    if (Array.isArray(value)) return value.map(normalize);

    const result = {};
    for (const key of Object.keys(value)) {
        result[key] = normalize(value[key]);
    }
    return result;
}

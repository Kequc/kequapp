import { Ex } from '../main';
import { BodyFormat } from './get-body';

import { BodyJson } from '../../types/body-parser';

export type BodyOptions = {
    multipart?: boolean;
    arrays?: string[];
    required?: string[];
    validate?: (body: BodyJson) => string | void;
    postProcess?: (body: BodyJson) => BodyJson;
};

function verifyBody (body: BodyJson, format?: BodyFormat | BodyOptions): BodyJson {
    if (!format || typeof format === 'number') return body;

    const result = Object.assign({}, body);

    for (const key of format.required || []) {
        if (isEmpty(result[key])) {
            throw Ex.UnprocessableEntity(`Missing required parameter: ${key}`, {
                body,
                required: format.required
            });
        }
    }

    for (const key of format.arrays || []) {
        if (!Array.isArray(result[key])) {
            result[key] = isEmpty(result[key]) ? [] : [result[key]];
        }
    }

    if (typeof format.validate === 'function') {
        const problem = format.validate(result);
        if (problem) {
            throw Ex.UnprocessableEntity(problem, {
                body
            });
        }
    }

    if (typeof format.postProcess === 'function') {
        return format.postProcess(result);
    }

    return result;
}

export default verifyBody;

function isEmpty (value: unknown): boolean {
    return value === null || value === undefined;
}

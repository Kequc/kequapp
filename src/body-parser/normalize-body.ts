import { Ex } from '../main';
import { BodyOptions } from './get-body';

import { BodyJson } from '../../types/main';

function normalizeBody (body: BodyJson, options: BodyOptions): BodyJson {
    const result = { ...body };

    for (const key of options.required || []) {
        if (isEmpty(result[key])) {
            throw Ex.UnprocessableEntity(`Missing required parameter: ${key}`, {
                body,
                required: options.required
            });
        }
    }

    for (const key of options.array || []) {
        if (!Array.isArray(result[key])) {
            result[key] = isEmpty(result[key]) ? [] : [result[key]];
        }
    }

    if (typeof options.validate === 'function') {
        const problem = options.validate(result);
        if (problem) {
            throw Ex.UnprocessableEntity(problem, {
                body
            });
        }
    }

    if (typeof options.postProcess === 'function') {
        return options.postProcess(result);
    }

    return result;
}

export default normalizeBody;

function isEmpty (value: unknown): boolean {
    return value === null || value === undefined;
}

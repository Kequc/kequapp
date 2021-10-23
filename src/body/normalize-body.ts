import { BodyJson, BodyOptions } from './create-get-body';
import Ex from '../util/ex';

function normalizeBody (body: BodyJson, options: BodyOptions): BodyJson {
    const result = { ...body };
    const {
        required = [],
        arrays = [],
        numbers = [],
        booleans = [],
        validate,
        postProcess
    } = options;

    // required
    for (const key of required) {
        if (isEmpty(result[key]) || result[key].trim() === '') {
            throw Ex.UnprocessableEntity(`Missing required parameter: ${key}`, {
                body,
                required
            });
        }
    }

    // arrays
    for (const key of arrays) {
        if (!Array.isArray(result[key])) {
            result[key] = isEmpty(result[key]) ? [] : [result[key]];
        }
    }

    // numbers
    for (const key of numbers) {
        if (isEmpty(result[key])) continue;

        let success = true;

        if (Array.isArray(result[key])) {
            result[key] = result[key].map(toNumber);
            success = !result[key].some((value: number) => isNaN(value));
        } else {
            result[key] = toNumber(result[key]);
            success = !isNaN(result[key]);
        }

        if (!success) {
            throw Ex.UnprocessableEntity(`Unable to convert number: ${key}`, {
                body,
                numbers
            });
        }
    }

    // booleans
    for (const key of booleans) {
        if (Array.isArray(result[key])) {
            result[key] = result[key].map(toBoolean);
        } else {
            result[key] = toBoolean(result[key]);
        }
    }

    // not arrays!
    for (const key of Object.keys(result)) {
        if (!arrays.includes(key) && Array.isArray(result[key])) {
            result[key] = result[key][0];
        }
    }

    // validate
    if (typeof validate === 'function') {
        const problem = validate(result);
        if (problem) {
            throw Ex.UnprocessableEntity(problem, {
                body
            });
        }
    }

    // post process
    if (typeof postProcess === 'function') {
        return postProcess(result);
    }
    return result;
}

export default normalizeBody;

function isEmpty (value: unknown): boolean {
    return value === null || value === undefined;
}

function toNumber (value: string): number {
    return parseInt(value, 10);
}

function toBoolean (value: unknown): boolean {
    if (value === '0' || value === 'false') {
        return false;
    } else {
        return Boolean(value);
    }
}

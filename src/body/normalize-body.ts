import { BodyJson, BodyOptions } from './create-get-body';
import Ex from '../util/ex';

function normalizeBody (body: BodyJson, options: BodyOptions): BodyJson {
    if (options.skipNormalize === true) return body;

    const result = { ...body };
    const {
        required = [],
        arrays = [],
        numbers = [],
        booleans = [],
        validate,
        postProcess
    } = options;

    // arrays
    for (const key of arrays) {
        if (!Array.isArray(result[key])) {
            result[key] = isEmpty(result[key]) ? [] : [result[key]];
        }
    }

    // not arrays!
    for (const key of Object.keys(result)) {
        if (arrays.includes(key)) continue;

        if (Array.isArray(result[key])) {
            result[key] = result[key][0];
        }
    }

    // required
    for (const key of required) {
        if (isEmpty(result[key])) {
            throw Ex.UnprocessableEntity(`Value ${key} cannot be empty`, {
                body,
                required
            });
        }
    }

    // numbers
    for (const key of numbers) {
        if (!(key in result)) continue;

        let success = true;

        if (Array.isArray(result[key])) {
            result[key] = result[key].map(toNumber);
            success = !result[key].some((value: number) => isNaN(value));
        } else {
            result[key] = toNumber(result[key]);
            success = !isNaN(result[key]);
        }

        if (!success) {
            throw Ex.UnprocessableEntity(`Value ${key} must be a number`, {
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
    if (value === null) return true;
    if (value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length < 1) return true;
    return false;
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

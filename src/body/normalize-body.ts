import { BodyJson, BodyOptions } from './create-get-body';
import Ex from '../utils/ex';

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
            result[key] = result[key] === undefined ? [] : [result[key]];
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
        if (arrays.includes(key)) {
            result[key] = result[key].filter((value: unknown) => !isEmpty(value));
            if (result[key].length > 0) continue;
        } else {
            if (!isEmpty(result[key])) continue;
        }

        throw Ex.UnprocessableEntity(`Value ${key} is required`, {
            body,
            required
        });
    }

    // numbers
    for (const key of numbers) {
        if (!(key in result)) continue;

        let failed = false;

        if (arrays.includes(key)) {
            result[key] = result[key].map(toNumber);
            failed = result[key].some((value: number) => isNaN(value));
        } else {
            result[key] = toNumber(result[key]);
            failed = isNaN(result[key]);
        }

        if (failed) {
            throw Ex.UnprocessableEntity(`Value ${key} must be a number`, {
                body,
                numbers
            });
        }
    }

    // booleans
    for (const key of booleans) {
        if (arrays.includes(key)) {
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

    if (typeof postProcess === 'function') {
        // post process
        return postProcess(result);
    } else {
        return result;
    }
}

export default normalizeBody;

function isEmpty (value: unknown): boolean {
    if (value === null) return true;
    if (value === undefined) return true;
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

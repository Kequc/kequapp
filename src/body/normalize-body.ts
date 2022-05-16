import { TBodyJson, TBodyJsonValue, TBodyOptions } from '../types';
import Ex from '../util/tools/ex';

export default function normalizeBody (body: TBodyJson, options: TBodyOptions): TBodyJson {
    if (options.skipNormalize === true) return body;

    const result: TBodyJson = { ...body };
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
            const value = (result[key] as TBodyJsonValue[])[0];
            result[key] = value;
        }
    }

    // required
    for (const key of required) {
        if (arrays.includes(key)) {
            const values = (result[key] as TBodyJsonValue[]).filter(value => !isEmpty(value));
            result[key] = values;
            if (values.length > 0) continue;
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
            const values = (result[key] as TBodyJsonValue[]).map(toNumber);
            result[key] = values;
            failed = values.some(value => isNaN(value));
        } else {
            const value = toNumber(result[key]);
            result[key] = value;
            failed = isNaN(value);
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
        if (!(key in result)) continue;

        if (arrays.includes(key)) {
            const values = (result[key] as TBodyJsonValue[]).map(toBoolean);
            result[key] = values;
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

function isEmpty (value: TBodyJsonValue): boolean {
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
}

function toNumber (value: TBodyJsonValue): number {
    return parseFloat(value as string);
}

function toBoolean (value: TBodyJsonValue): boolean {
    if (value === '0' || value === 'false') {
        return false;
    } else {
        return Boolean(value);
    }
}

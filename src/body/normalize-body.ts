import Ex from '../built-in/tools/ex.ts';
import type { TBodyJson, TBodyJsonValue, TGetBodyOptions } from '../types.ts';

export default function normalizeBody(
    body: TBodyJson,
    options: TGetBodyOptions,
): TBodyJson {
    const result: TBodyJson = { ...body };
    if (options.skipNormalize === true) return result;
    const {
        required = [],
        arrays = [],
        numbers = [],
        booleans = [],
        trim = false,
        validate,
    } = options;

    // trim strings
    if (trim) {
        for (const key of Object.keys(result)) {
            if (Array.isArray(result[key])) {
                result[key] = result[key]
                    .map(trimValue)
                    .filter((v) => v !== undefined);
            } else {
                const value = trimValue(result[key]);
                if (value === undefined) delete result[key];
                else result[key] = value;
            }
        }
    }

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
        if (Array.isArray(result[key])) {
            const values = result[key].filter((value) => !isEmpty(value));
            result[key] = values;
            if (values.length > 0) continue;
        } else {
            if (!isEmpty(result[key])) continue;
        }
        throw Ex.UnprocessableEntity(`Value ${key} is required`, {
            body,
            required,
        });
    }

    // numbers
    for (const key of numbers) {
        if (!(key in result)) continue;
        if (Array.isArray(result[key])) {
            const values = result[key].map(toNumber);
            result[key] = values;
            if (!values.some((value) => Number.isNaN(value))) continue;
        } else {
            const value = toNumber(result[key]);
            result[key] = value;
            if (!Number.isNaN(value)) continue;
        }
        throw Ex.UnprocessableEntity(`Value ${key} must be a number`, {
            body,
            numbers,
        });
    }

    // booleans
    for (const key of booleans) {
        if (!(key in result)) continue;
        if (Array.isArray(result[key])) {
            const values = result[key].map(toBoolean);
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
                body,
            });
        }
    }

    return result;
}

function trimValue(value: TBodyJsonValue): TBodyJsonValue | undefined {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
}

function isEmpty(value: TBodyJsonValue): boolean {
    return value === null || value === undefined;
}

function toNumber(value: TBodyJsonValue): number {
    return parseFloat(value as string);
}

function toBoolean(value: TBodyJsonValue): boolean {
    if (typeof value === 'string' && value.toLowerCase() === 'false') {
        return false;
    } else if (value === '0') {
        return false;
    } else {
        return Boolean(value);
    }
}

import Ex from '../built-in/tools/ex.ts';
import type { BodyJson, BodyJsonValue, GetBodyOptions } from '../types.ts';

export default function normalizeBody(body: BodyJson, options: GetBodyOptions): BodyJson {
    const result: BodyJson = { ...body };
    const errors: Record<string, string> = {};
    if (options.skipNormalize === true) return result;
    const {
        required = [],
        arrays = [],
        numbers = [],
        booleans = [],
        trim = false,
        validate,
        throws = true,
    } = options;

    // trim strings
    if (trim) {
        for (const key of Object.keys(result)) {
            if (Array.isArray(result[key])) {
                result[key] = result[key].map(trimValue).filter((v) => v !== undefined);
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
        errors[key] = 'is required';
    }

    // numbers
    for (const key of numbers) {
        if (!(key in result) || key in errors) continue;
        if (Array.isArray(result[key])) {
            const values = result[key].map(toNumber);
            result[key] = values;
            if (!values.some((value) => Number.isNaN(value))) continue;
        } else {
            const value = toNumber(result[key]);
            result[key] = value;
            if (!Number.isNaN(value)) continue;
        }
        errors[key] = 'must be a number';
    }

    // booleans
    for (const key of booleans) {
        if (!(key in result) || key in errors) continue;
        if (Array.isArray(result[key])) {
            const values = result[key].map(toBoolean);
            result[key] = values;
        } else {
            result[key] = toBoolean(result[key]);
        }
    }

    // validate
    if (validate) {
        for (const [key, validator] of Object.entries(validate)) {
            if (!(key in result) || key in errors) continue;
            const error = validator?.(result[key], result);
            if (error) errors[key] = error;
        }
    }

    const key = Object.keys(errors)[0];
    if (throws) {
        // old school
        if (!key) return result;
        throw Ex.UnprocessableEntity(`Value ${key} ${errors[key]}`, {
            errors,
            body,
        });
    } else {
        if (!key) return { ...result, ok: true };
        return { errors, ok: false };
    }
}

function trimValue(value: BodyJsonValue): BodyJsonValue | undefined {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
}

function isEmpty(value: BodyJsonValue): boolean {
    return value === null || value === undefined;
}

function toNumber(value: BodyJsonValue): number {
    return parseFloat(value as string);
}

function toBoolean(value: BodyJsonValue): boolean {
    if (typeof value === 'string' && value.toLowerCase() === 'false') {
        return false;
    } else if (value === '0') {
        return false;
    } else {
        return Boolean(value);
    }
}

import assert from 'assert';
import 'kequtest';
import {
    validateArray,
    validateExists,
    validateObject,
    validatePathname,
    validateType
} from '../../src/util/validate';

describe('validateObject', () => {
    it('does nothing if undefined', () => {
        assert.doesNotThrow(() => validateObject(undefined, 'Test'));
    });

    it('does nothing if object', () => {
        assert.doesNotThrow(() => validateObject({}, 'Test'));
    });

    it('throws error if null', () => {
        assert.throws(() => validateObject(null, 'Test'), {
            message: 'Test must be an object'
        });
    });

    it('throws error if array', () => {
        assert.throws(() => validateObject(['hello'], 'Test'), {
            message: 'Test must be an object'
        });
    });

    it('throws error if not object', () => {
        assert.throws(() => validateObject('hello', 'Test'), {
            message: 'Test must be an object'
        });
    });

    it('throws error if invalid type', () => {
        assert.throws(() => validateObject({ test: 'hello' }, 'Test', 'number'), {
            message: 'Test test must be a number'
        });
    });

    it('does nothing if valid type', () => {
        assert.doesNotThrow(() => validateObject({ test: 1 }, 'Test', 'number'));
    });
});

describe('validateArray', () => {
    it('does nothing if undefined', () => {
        assert.doesNotThrow(() => validateArray(undefined, 'Test'));
    });

    it('does nothing if array', () => {
        assert.doesNotThrow(() => validateArray([], 'Test'));
    });

    it('throws error if not array', () => {
        assert.throws(() => validateArray('hello', 'Test'), {
            message: 'Test must be an array'
        });
    });

    it('throws error if invalid type', () => {
        assert.throws(() => validateArray(['hello'], 'Test', 'number'), {
            message: 'Test item must be a number'
        });
    });

    it('does nothing if valid type', () => {
        assert.doesNotThrow(() => validateArray([1], 'Test', 'number'));
    });
});

describe('validateType', () => {
    it('does nothing if undefined', () => {
        assert.doesNotThrow(() => validateType(undefined, 'Test', 'number'));
    });

    it('throws error if invalid type', () => {
        assert.throws(() => validateType('hello', 'Test', 'number'), {
            message: 'Test must be a number'
        });
    });

    it('does nothing if valid type', () => {
        assert.doesNotThrow(() => validateType(1, 'Test', 'number'));
    });

    it('validates object type', () => {
        assert.doesNotThrow(() => validateType(undefined, 'Test', 'object'));
        assert.doesNotThrow(() => validateType({}, 'Test', 'object'));
        assert.throws(() => validateObject(null, 'Test', 'object'), {
            message: 'Test must be an object'
        });
        assert.throws(() => validateObject(['hello'], 'Test', 'object'), {
            message: 'Test must be an object'
        });
        assert.throws(() => validateObject('hello', 'Test', 'object'), {
            message: 'Test must be an object'
        });
    });
});

describe('validatePathname', () => {
    it('does nothing if undefined', () => {
        assert.doesNotThrow(() => validatePathname(undefined, 'Test'));
    });

    it('throws error if not a string', () => {
        assert.throws(() => validatePathname(1, 'Test'), {
            message: 'Test must be a string'
        });
    });

    it('does nothing if pathname', () => {
        assert.doesNotThrow(() => validatePathname('/hello/there', 'Test'));
    });

    it('throws error if not pathname', () => {
        assert.throws(() => validatePathname('hello/there', 'Test'), {
            message: 'Test must start with \'/\''
        });
    });

    it('does nothing if wild pathname', () => {
        assert.doesNotThrow(() => validatePathname('/hello/there/**', 'Test', true));
    });

    it('throws error if not wild pathname', () => {
        assert.throws(() => validatePathname('/hello/there', 'Test', true), {
            message: 'Test must end with \'/**\''
        });
    });
});

describe('validateExists', () => {
    it('does nothing if not undefined', () => {
        const values = [1, null, {}, () => {}, 'hello'];

        for (const value of values) {
            assert.doesNotThrow(() => validateExists(value, 'Test'));
        }
    });

    it('throws error if undefined', () => {
        assert.throws(() => validateExists(undefined, 'Test'), {
            message: 'Test is undefined'
        });
    });
});

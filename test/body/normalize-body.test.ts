import assert from 'assert';
import normalizeBody from '../../src/body/normalize-body';

it('returns the body', function () {
    const body = {
        name: 'April',
        age: '23'
    };
    const options = {};

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23'
    });
});

it('throws error on missing required parameter', function () {
    const body = {
        name: 'April',
        age: '23'
    };
    const options = {
        required: ['name', 'ownedPets', 'age']
    };

    assert.throws(() => normalizeBody(body, options), {
        statusCode: 422,
        message: 'Missing required parameter: ownedPets'
    });
});

it('throws error on null required parameter', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: null
    };
    const options = {
        required: ['name', 'ownedPets', 'age']
    };

    assert.throws(() => normalizeBody(body, options), {
        statusCode: 422,
        message: 'Missing required parameter: ownedPets'
    });
});

it('converts value to an array', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: 'cat'
    };
    const options = {
        array: ['ownedPets']
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: ['cat']
    });
});

it('converts empty value to an array', function () {
    const body = {
        name: 'April',
        age: '23'
    };
    const options = {
        array: ['ownedPets']
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: []
    });
});

it('converts null value to an array', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: null
    };
    const options = {
        array: ['ownedPets']
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: []
    });
});

it('throws error on missing required array parameter', function () {
    const body = {
        name: 'April',
        age: '23'
    };
    const options = {
        array: ['ownedPets'],
        required: ['name', 'ownedPets', 'age']
    };

    assert.throws(() => normalizeBody(body, options), {
        statusCode: 422,
        message: 'Missing required parameter: ownedPets'
    });
});

it('does nothing to array value', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: ['cat']
    };
    const options = {
        array: ['ownedPets']
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: ['cat']
    });
});

it('runs external validation', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: 'cat'
    };
    const options = {
        array: ['ownedPets'],
        validate: (result) => {
            if (result.ownedPets.length < 2) return 'Must have two pets';
        }
    };

    assert.throws(() => normalizeBody(body, options), {
        statusCode: 422,
        message: 'Must have two pets'
    });
});

it('passes successful external validation', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: 'cat'
    };
    const options = {
        array: ['ownedPets'],
        validate: (result) => {
            if (result.ownedPets.length > 2) return 'Too many pets';
        }
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: ['cat']
    });
});

it('runs post processing', function () {
    const body = {
        name: 'April',
        age: '23',
        ownedPets: 'cat'
    };
    const options = {
        array: ['ownedPets'],
        postProcess: (result) => {
            return {
                ...result,
                ownedPets: result.ownedPets.length
            };
        }
    };

    assert.deepStrictEqual(normalizeBody(body, options), {
        name: 'April',
        age: '23',
        ownedPets: 1
    });
});

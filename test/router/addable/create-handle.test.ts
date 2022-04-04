import 'kequtest';
import assert from 'assert';
import createHandle from '../../../src/router/addable/create-handle';

it('creates a handle', () => {
    const handle = () => {};
    assert.strictEqual(createHandle(handle), handle);
});

it('throws error if undefined', () => {
    assert.throws(() => createHandle(undefined), {
        message: 'Handle is undefined'
    });
});

it('throws error if not a function', () => {
    // @ts-ignore
    assert.throws(() => createHandle(1), {
        message: 'Handle must be a function'
    });
});
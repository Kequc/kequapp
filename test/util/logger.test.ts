import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { logger, extendLogger } from '../../src/util/logger.ts';

it('returns a logger', () => {
    assert.equal(typeof logger.error, 'function');
    assert.equal(typeof logger.warn, 'function');
    assert.equal(typeof logger.info, 'function');
});

describe('extendLogger', () => {
    it('returns the logger', () => {
        const result = extendLogger(logger, undefined);
        assert.equal(logger.error, result.error);
        assert.equal(logger.warn, result.warn);
        assert.equal(logger.info, result.info);
    });

    it('extends part of the logger', () => {
        const warn = () => {};
        const info = () => {};
        const result = extendLogger(logger, { warn, info });
        assert.equal(result.error, logger.error);
        assert.equal(result.warn, warn);
        assert.equal(result.info, info);
    });
});

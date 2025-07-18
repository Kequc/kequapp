import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import logger, { extendLogger } from '../../src/util/logger.ts';

it('returns a logger', () => {
    assert.equal(typeof logger.error, 'function');
    assert.equal(typeof logger.warn, 'function');
    assert.equal(typeof logger.info, 'function');
    assert.equal(typeof logger.http, 'function');
    assert.equal(typeof logger.verbose, 'function');
    assert.equal(typeof logger.debug, 'function');
    assert.equal(typeof logger.silly, 'function');
    assert.equal(typeof logger.log, 'function');
});

describe('extendLogger', () => {
    it('returns the logger', () => {
        const result = extendLogger(logger, undefined);
        assert.equal(logger.error, result.error);
        assert.equal(logger.warn, result.warn);
        assert.equal(logger.info, result.info);
        assert.equal(logger.http, result.http);
        assert.equal(logger.verbose, result.verbose);
        assert.equal(logger.debug, result.debug);
        assert.equal(logger.silly, result.silly);
        assert.equal(logger.log, result.log);
    });

    it('extends part of the logger', () => {
        const warn = () => {};
        const http = () => {};
        const result = extendLogger(logger, { warn, http });
        assert.equal(result.error, logger.error);
        assert.equal(result.warn, warn);
        assert.equal(result.info, logger.info);
        assert.equal(result.http, http);
        assert.equal(result.verbose, logger.verbose);
        assert.equal(result.debug, logger.debug);
        assert.equal(result.silly, logger.silly);
        assert.equal(result.log, logger.log);
    });
});

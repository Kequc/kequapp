import assert from 'assert';
import 'kequtest';
import logger, { extendLogger } from '../../src/util/logger';

it('returns a logger', () => {
    assert.strictEqual(typeof logger.error, 'function');
    assert.strictEqual(typeof logger.warn, 'function');
    assert.strictEqual(typeof logger.info, 'function');
    assert.strictEqual(typeof logger.http, 'function');
    assert.strictEqual(typeof logger.verbose, 'function');
    assert.strictEqual(typeof logger.debug, 'function');
    assert.strictEqual(typeof logger.silly, 'function');
    assert.strictEqual(typeof logger.log, 'function');
});

describe('extendLogger', () => {
    it('returns the logger', () => {
        const result = extendLogger(logger, undefined);
        assert.strictEqual(logger.error, result.error);
        assert.strictEqual(logger.warn, result.warn);
        assert.strictEqual(logger.info, result.info);
        assert.strictEqual(logger.http, result.http);
        assert.strictEqual(logger.verbose, result.verbose);
        assert.strictEqual(logger.debug, result.debug);
        assert.strictEqual(logger.silly, result.silly);
        assert.strictEqual(logger.log, result.log);
    });

    it('extends part of the logger', () => {
        const warn = () => {};
        const http = () => {};
        const result = extendLogger(logger, { warn, http });
        assert.strictEqual(result.error, logger.error);
        assert.strictEqual(result.warn, warn);
        assert.strictEqual(result.info, logger.info);
        assert.strictEqual(result.http, http);
        assert.strictEqual(result.verbose, logger.verbose);
        assert.strictEqual(result.debug, logger.debug);
        assert.strictEqual(result.silly, logger.silly);
        assert.strictEqual(result.log, logger.log);
    });
});

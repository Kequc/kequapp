import assert from 'assert';
import 'kequtest';
import createConfig, { DEFAULT_CONFIG } from '../../../src/router/modules/create-config';

it('creates a config', () => {
    const addable = createConfig();

    assert.deepStrictEqual(addable(), {
        configs: [{
            parts: ['**'],
            config: DEFAULT_CONFIG
        }]
    });
});

it('creates a config with parts', () => {
    const addable = createConfig('/hello/there');

    assert.deepStrictEqual(addable(), {
        configs: [{
            parts: ['hello', 'there'],
            config: DEFAULT_CONFIG
        }]
    });
});

it('creates a config with default logger', () => {
    const addable = createConfig({ logger: true, autoHead: false });

    assert.deepStrictEqual(addable(), {
        configs: [{
            parts: ['**'],
            config: {
                autoHead: false,
                logger: DEFAULT_CONFIG.logger
            }
        }]
    });
});

it('creates a config with empty logger', () => {
    const addable = createConfig({ logger: false });
    const config = addable().configs![0].config;

    assert.strictEqual(config.autoHead, DEFAULT_CONFIG.autoHead);
    assert.notStrictEqual(config.logger, DEFAULT_CONFIG.logger);
    assert.strictEqual(typeof config.logger.debug, 'function');
    assert.strictEqual(typeof config.logger.log, 'function');
    assert.strictEqual(typeof config.logger.warn, 'function');
    assert.strictEqual(typeof config.logger.error, 'function');
});

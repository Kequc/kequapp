import {
    IAddable,
    TAddableData,
    TConfig,
    TConfigInput,
    TPathname
} from '../../types';
import { extractOptions, extractUrl, getParts } from '../../util/extract';

export const DEFAULT_CONFIG: TConfig = {
    logger: console,
    autoHead: true
};

interface ICreateConfig {
    (url: TPathname, config?: Partial<TConfigInput>): IAddable;
    (config?: Partial<TConfigInput>): IAddable;
}

export default createConfig as ICreateConfig;

function createConfig (...params: unknown[]): IAddable {
    const parts = getParts(extractUrl(params, '/**'));
    const config = getConfig(extractOptions<TConfigInput>(params, DEFAULT_CONFIG));

    function route (): Partial<TAddableData> {
        return {
            configs: [{
                parts,
                config
            }]
        };
    }

    return route as IAddable;
}

function getConfig (options: TConfigInput): TConfig {
    if (typeof options.logger === 'boolean') {
        const logger = options.logger ? DEFAULT_CONFIG.logger : {
            debug () {},
            log () {},
            warn () {},
            error () {}
        };

        return { ...options, logger };
    }

    return options as TConfig;
}

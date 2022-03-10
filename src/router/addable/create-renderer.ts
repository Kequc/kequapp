import {
    IAddable,
    ICreateRenderer,
    TAddableData,
    TRenderer
} from '../../types';
import { extractHandles, extractParts } from '../../util/helpers';
import { validateExists, validateType } from '../../util/validate';

export default createRenderer as ICreateRenderer;

function createRenderer (...params: unknown[]): IAddable {
    const parts = extractParts(params, true);
    const mime = extractMime(params)!;
    const [handle] = extractHandles(params) as unknown as TRenderer[];

    validateExists(mime, 'Renderer mime');
    validateType(mime, 'Renderer mime', 'string');

    validateExists(handle, 'Renderer handle');
    validateType(handle, 'Renderer handle', 'function');

    function renderer (): Partial<TAddableData> {
        return {
            renderers: [{
                parts,
                mime,
                handle
            }]
        };
    }

    return renderer as IAddable;
}

function extractMime (params: unknown[]): string | undefined {
    if (typeof params[0] === 'string') {
        return params.shift() as string;
    }
}

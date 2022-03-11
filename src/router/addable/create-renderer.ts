import {
    IAddable,
    ICreateRenderer,
    TAddableData,
    TRenderer
} from '../../types';
import { extractContentType, extractHandles, extractParts } from '../../util/helpers';
import { validateExists } from '../../util/validate';

export default createRenderer as ICreateRenderer;

function createRenderer (...params: unknown[]): IAddable {
    const parts = extractParts(params, true);
    const contentType = extractContentType(params)!;
    const [handle] = extractHandles(params) as unknown as TRenderer[];

    validateExists(contentType, 'Renderer contentType');
    validateExists(handle, 'Renderer handle');

    function renderer (): Partial<TAddableData> {
        return {
            renderers: [{
                parts,
                contentType,
                handle
            }]
        };
    }

    return renderer as IAddable;
}

import {
    IAddable,
    TAddableData,
    TPathname,
    TRenderer
} from '../../types';
import {
    extractContentType,
    extractHandles,
    extractPathname,
    getParts
} from '../../util/extract';
import { validateExists } from '../../util/validate';

interface ICreateRenderer {
    (contentType: string, pathname: TPathname, handle: TRenderer): IAddable;
    (contentType: string, handle: TRenderer): IAddable;
}

export default createRenderer as ICreateRenderer;

function createRenderer (...params: unknown[]): IAddable {
    const contentType = extractContentType(params);
    const parts = getParts(extractPathname(params, '/**'));
    const [handle] = extractHandles<TRenderer>(params);

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

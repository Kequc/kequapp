import {
    IAddable,
    TAddableData,
    TPathname,
    TRenderer
} from '../../types';
import {
    extractContentType,
    extractHandles,
    extractUrl,
    getParts
} from '../../util/extract';
import { validateExists } from '../../util/validate';

interface ICreateRenderer {
    (contentType: string, url: TPathname, handle: TRenderer): IAddable;
    (url: TPathname, handle: TRenderer): IAddable;
    (contentType: string, handle: TRenderer): IAddable;
    (handle: TRenderer): IAddable;
}

export default createRenderer as ICreateRenderer;

function createRenderer (...params: unknown[]): IAddable {
    const contentType = extractContentType(params);
    const parts = getParts(extractUrl(params, '/**'));
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

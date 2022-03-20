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

export default createRenderer as ICreateRenderer;

interface ICreateRenderer {
    (pathname: TPathname, contentType: string, handle: TRenderer): IAddable;
    (contentType: string, handle: TRenderer): IAddable;
}

function createRenderer (...params: unknown[]): IAddable {
    const parts = getParts(extractPathname(params, '/**'));
    const contentType = extractContentType(params);
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

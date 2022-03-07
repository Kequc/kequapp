import { IAddable, ICreateRenderer, TAddableData, TRenderer } from '../types';
import { validateExists, validateType } from '../util/validate';

function createRenderer (mime: string, handle: TRenderer): IAddable {
    validateExists(mime, 'Mime');
    validateType(mime, 'Mime', 'string');
    validateExists(handle, 'Handle');
    validateType(handle, 'Handle', 'function');

    function renderer (): Partial<TAddableData>[] {
        return [{
            renderers: [{
                mime,
                handle
            }]
        }];
    }

    return renderer as IAddable;
}

export default createRenderer as ICreateRenderer;

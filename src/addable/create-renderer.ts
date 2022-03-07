import { IAddable, ICreateRenderer, TAddableData, TRenderer } from '../types';
import { validateType } from '../util/validate';

function createRenderer (mime: string, handle: TRenderer): IAddable {
    validateType(mime, 'Mime', 'string');
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

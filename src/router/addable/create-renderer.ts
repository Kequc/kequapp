import {
    IAddable,
    ICreateRenderer,
    TAddableData,
    TRenderer
} from '../../types';

export default createRenderer as ICreateRenderer;

function createRenderer (mime: string, handle: TRenderer): IAddable {
    function renderer (): TAddableData {
        return {
            renderers: [{
                mime,
                handle
            }]
        };
    }

    return renderer as IAddable;
}

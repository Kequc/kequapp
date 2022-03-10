import {
    IAddable,
    ICreateErrorHandler,
    TAddableData,
    TErrorHandler
} from '../../types';
import { extractHandles, extractParts } from '../../util/helpers';
import { validateExists, validateType } from '../../util/validate';

export default createErrorHandler as ICreateErrorHandler;

function createErrorHandler (...params: unknown[]): IAddable {
    const parts = extractParts(params, true);
    const [handle] = extractHandles(params) as unknown as TErrorHandler[];

    validateExists(handle, 'Error handler');
    validateType(handle, 'Error handler', 'function');

    function errorHandler (): Partial<TAddableData> {
        return {
            errorHandlers: [{
                parts,
                handle
            }]
        };
    }

    return errorHandler as IAddable;
}

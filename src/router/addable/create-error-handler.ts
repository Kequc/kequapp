import {
    IAddable,
    ICreateErrorHandler,
    TAddableData,
    TErrorHandler
} from '../../types';
import { extractContentType, extractHandles, extractParts } from '../../util/helpers';
import { validateExists } from '../../util/validate';

export default createErrorHandler as ICreateErrorHandler;

function createErrorHandler (...params: unknown[]): IAddable {
    const parts = extractParts(params, true);
    const contentType = extractContentType(params) || '*';
    const [handle] = extractHandles(params) as unknown as TErrorHandler[];

    validateExists(handle, 'Error handler');

    function errorHandler (): Partial<TAddableData> {
        return {
            errorHandlers: [{
                parts,
                contentType,
                handle
            }]
        };
    }

    return errorHandler as IAddable;
}

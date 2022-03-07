import { IAddable, ICreateErrorHandler, TAddableData, TErrorHandler } from '../types';
import { validateExists, validateType } from '../util/validate';

function createErrorHandler (handle: TErrorHandler): IAddable {
    validateExists(handle, 'Error handler');
    validateType(handle, 'Error handler', 'function');

    function errorHandler (): Partial<TAddableData>[] {
        return [{
            errorHandler: handle
        }];
    }

    return errorHandler as IAddable;
}

export default createErrorHandler as ICreateErrorHandler;

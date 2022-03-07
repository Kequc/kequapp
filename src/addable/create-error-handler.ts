import { IAddable, ICreateErrorHandler, TAddableData, TErrorHandler } from '../types';
import { validateType } from '../util/validate';

function createErrorHandler (handle: TErrorHandler): IAddable {
    validateType(handle, 'Error handler', 'function');

    function errorHandler (): Partial<TAddableData>[] {
        return [{
            errorHandler: handle
        }];
    }

    return errorHandler as IAddable;
}

export default createErrorHandler as ICreateErrorHandler;

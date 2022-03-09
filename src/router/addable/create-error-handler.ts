import {
    IAddable,
    ICreateErrorHandler,
    TAddableData,
    TErrorHandler
} from '../../types';

export default createErrorHandler as ICreateErrorHandler;

function createErrorHandler (handle: TErrorHandler): IAddable {
    function errorHandler (): TAddableData {
        return {
            errorHandler: handle
        };
    }

    return errorHandler as IAddable;
}

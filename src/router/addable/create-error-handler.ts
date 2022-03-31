import {
    IAddable,
    TAddableData,
    TErrorHandler,
    TPathname
} from '../../types';
import {
    extractContentType,
    extractHandles,
    extractPathname,
    getParts
} from '../../util/extract';
import { validateExists } from '../../util/validate';

interface ICreateErrorHandler {
    (contentType: string, pathname: TPathname, handle: TErrorHandler): IAddable;
    (contentType: string, handle: TErrorHandler): IAddable;
    (pathname: TPathname, handle: TErrorHandler): IAddable;
    (handle: TErrorHandler): IAddable;
}

export default createErrorHandler as ICreateErrorHandler;

function createErrorHandler (...params: unknown[]): IAddable {
    const contentType = extractContentType(params);
    const parts = getParts(extractPathname(params, '/**'));
    const [handle] = extractHandles<TErrorHandler>(params);

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

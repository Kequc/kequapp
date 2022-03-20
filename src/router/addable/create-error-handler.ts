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

export default createErrorHandler as ICreateErrorHandler;

interface ICreateErrorHandler {
    (pathname: TPathname, contentType: string, handle: TErrorHandler): IAddable;
    (pathname: TPathname, handle: TErrorHandler): IAddable;
    (contentType: string, handle: TErrorHandler): IAddable;
    (handle: TErrorHandler): IAddable;
}

function createErrorHandler (...params: unknown[]): IAddable {
    const parts = getParts(extractPathname(params, '/**'));
    const contentType = extractContentType(params);
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

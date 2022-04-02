import { THandle } from '../types';
import { validateExists, validateType } from '../util/validate';

interface ICreateHandle {
    (handle: THandle): THandle;
}

export default createHandle as ICreateHandle;

function createHandle (handle: THandle): THandle {
    validateExists(handle, 'Handle');
    validateType(handle, 'Handle', 'function');

    return handle;
}

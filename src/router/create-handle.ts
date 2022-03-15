import { ICreateHandle, THandle } from '../types';

export default createHandle as ICreateHandle;

function createHandle (handle: THandle): THandle {
    return handle;
}

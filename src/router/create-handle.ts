import { THandle } from '../types';

export default createHandle as ICreateHandle;

interface ICreateHandle {
    (handle: THandle): THandle;
}

function createHandle (handle: THandle): THandle {
    return handle;
}

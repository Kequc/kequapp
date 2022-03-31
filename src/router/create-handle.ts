import { THandle } from '../types';

interface ICreateHandle {
    (handle: THandle): THandle;
}

export default createHandle as ICreateHandle;

function createHandle (handle: THandle): THandle {
    return handle;
}

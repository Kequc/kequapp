import { TAddableData } from '../types';
import { validateArray, validateExists, validateObject, validateType } from './validate';

export default function validateAdding (added: TAddableData[], adding: TAddableData[]): void {
    const checked: TAddableData[] = [...added];

    for (const data of adding) {
        validateExists(data, 'Addable');
        validateObject(data, 'Addable');
        validateArray(data.parts, 'Addable parts', 'string');
        validateArray(data.handles, 'Addable handles', 'function');
        validateType(data.method, 'Addable method', 'string');
        validateArray(data.renderers, 'Addable renderers', 'object');
        validateType(data.errorHandler, 'Addable error handler', 'function');

        if (data.parts.length > 0) {
            const exists = checked.find(existing => isDuplicate(existing, data));

            if (exists) {
                console.error('Route already exists', {
                    method: data.method,
                    pathname: `/${data.parts.join('/')}`,
                    matches: `/${exists.parts.join('/')}`
                });

                throw new Error('Route already exists');
            }

            checked.push(data);
        }

        for (const renderer of data.renderers) {
            validateType(renderer.mime, 'Mime', 'string');
            validateType(renderer.handle, 'Handle', 'function');
        }
    }
}

function isDuplicate (a: TAddableData, b: TAddableData): boolean {
    if (a.method !== b.method || a.parts.length !== b.parts.length) {
        return false;
    }

    const count = a.parts.length;

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];
        if (aa === bb) continue;
        if ((aa === '**' || aa[0] === ':') && (bb === '**' || bb[0] === ':')) continue;
        return false;
    }

    return true;
}

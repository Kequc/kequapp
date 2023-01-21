import { TCacheRoute, TLoggerLvl } from '../../types';
import { getParts } from './extract';

export default function warnDuplicates (routes: TCacheRoute[], warn: TLoggerLvl): void {
    for (let i = 0; i < routes.length; i++) {
        const partsi = getParts(routes[i].url);
        for (let j = 0; j < routes.length; j++) {
            if (i === j) continue;
            const partsj = getParts(routes[j].url);
            if (!isMatch(partsi, partsj)) continue;

            const a = partsi.join('/');
            const b = partsj.join('/');
            warn(`Duplicate route detected: '/${a}' '/${b}'`);
        }
    }
}

export function isMatch (aa: string[], bb: string[]): boolean {
    let aIsWild = false;
    let bIsWild = false;

    for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
        const a = aa[i];
        const b = bb[i];
        if (a === '**') aIsWild = true;
        if (b === '**') bIsWild = true;

        if ((aIsWild || a.startsWith(':')) && (bIsWild || b.startsWith(':'))) continue;
        if (a === b) continue;

        return false;
    }

    return true;
}

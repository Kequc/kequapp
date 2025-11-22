import type { CacheRoute, LoggerFn } from '../../types.ts';
import { getParts } from './extract.ts';

export function warnDuplicates(routes: CacheRoute[], warn: LoggerFn): void {
    const found: number[] = [];

    for (let i = 0; i < routes.length; i++) {
        const partsi = getParts(routes[i].url);
        for (let j = 0; j < routes.length; j++) {
            if (i === j || found.includes(j)) continue;
            if (routes[i].method !== routes[j].method) continue;
            const partsj = getParts(routes[j].url);
            if (!isMatch(partsi, partsj)) continue;

            found.push(i);
            const a = partsi.join('/');
            const b = partsj.join('/');
            warn(`Duplicate route detected: ${routes[i].method} '/${a}' '/${b}'`);
        }
    }
}

function isMatch(aa: string[], bb: string[]): boolean {
    let aIsWild = false;
    let bIsWild = false;

    for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
        const a = aa[i];
        const b = bb[i];
        if (a === '**') aIsWild = true;
        if (b === '**') bIsWild = true;

        if ((aIsWild || a?.startsWith(':')) && (bIsWild || b?.startsWith(':'))) continue;
        if (a === b) continue;

        return false;
    }

    return true;
}

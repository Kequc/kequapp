import { TLogger, TRoute } from '../types';

export default function warnDuplicates (routes: TRoute[], logger: TLogger): void {
    for (let i = 0; i < routes.length; i++) {
        for (let j = 0; j < routes.length; j++) {
            if (i === j) continue;
            if (!isMatch(routes[i].parts, routes[j].parts)) continue;

            const a = routes[i].parts.join('/');
            const b = routes[j].parts.join('/');
            logger.debug(`Duplicate route detected: /${a} /${b}`);
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

import { IRouter, TAddableData } from '../types';
import { getParts } from '../util/helpers';

type TSortable = { parts: string[], contentType?: string };
type TItem = { parts: string[] };

export default function createRouter (branchData: TAddableData): IRouter {
    const routes = [...branchData.routes].sort(priority);
    const renderers = [...branchData.renderers].sort(priority);
    const errorHandlers = [...branchData.errorHandlers].sort(priority);

    function router (pathname?: string): TAddableData {
        if (pathname) {
            const parts = getParts(pathname);

            return {
                routes: routes.filter(item => compare(item, parts)),
                renderers: renderers.filter(item => compare(item, parts)),
                errorHandlers: errorHandlers.filter(item => compare(item, parts))
            };
        }

        return {
            routes,
            renderers,
            errorHandlers
        };
    }

    return router;
}

function priority (a: TSortable, b: TSortable): number {
    const count = Math.max(a.parts.length, b.parts.length);

    for (let i = 0; i < count; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];

        if (aa === bb) continue;
        if (bb === undefined || aa === '**') return 1;
        if (aa === undefined || bb === '**') return -1;

        const aaa = aa[0] === ':';
        const bbb = bb[0] === ':';

        if (aaa && bbb) continue;
        if (aaa) return 1;
        if (bbb) return -1;

        return aa.localeCompare(bb);
    }

    if (a.contentType && b.contentType) {
        const aa = a.contentType.indexOf('*');
        const bb = b.contentType.indexOf('*');

        if (aa > -1 && bb > -1) return bb - aa;
        if (aa > -1) return 1;
        if (bb > -1) return -1;
    }

    return 0;
}

function compare (item: TItem, parts: string[]): boolean {
    for (let i = 0; i < item.parts.length; i++) {
        if (item.parts[i] === '**') return true;
        if (item.parts[i][0] === ':') continue;
        if (item.parts[i] === parts[i]) continue;
        return false;
    }

    return true;
}

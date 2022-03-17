import { IRouter, TAddableData } from '../types';
import { getParts } from '../util/helpers';

type TSortable = { parts: string[], contentType?: string };

export default function createRouter (branchData: TAddableData): IRouter {
    const routes = [...branchData.routes].sort(priority);
    const renderers = [...branchData.renderers].sort(priority);
    const errorHandlers = [...branchData.errorHandlers].sort(priority);

    function router (pathname?: string): TAddableData {
        if (pathname) {
            const clientParts = getParts(pathname);

            return {
                routes: routes.filter(item => compare(item.parts, clientParts)),
                renderers: renderers.filter(item => compare(item.parts, clientParts)),
                errorHandlers: errorHandlers.filter(item => compare(item.parts, clientParts))
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

function compare (parts: string[], clientParts: string[]): boolean {
    if (parts.length !== clientParts.length && !parts.includes('**')) {
        return false;
    }

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '**') return true;
        if (parts[i][0] !== ':' && parts[i] !== clientParts[i]) return false;
    }

    return true;
}

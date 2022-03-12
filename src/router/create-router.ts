import { IRouter, TAddableData } from '../types';
import { getParts } from '../util/helpers';

type TSortable = { parts: string[], contentType?: string };

export default function createRouter (branchData: TAddableData): IRouter {
    const routes = [...branchData.routes].sort(priority);
    const renderers = [...branchData.renderers].sort(priority);
    const errorHandlers = [...branchData.errorHandlers].sort(priority);

    function router (pathname?: string): TAddableData {
        if (pathname) {
            const parts = getParts(pathname);

            return {
                routes: routes.filter(item => compare(item.parts, parts)),
                renderers: renderers.filter(item => compare(item.parts, parts)),
                errorHandlers: errorHandlers.filter(item => compare(item.parts, parts))
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
    for (let i = 0; i < a.parts.length; i++) {
        const aa = a.parts[i];
        const bb = b.parts[i];

        if (aa === bb)  continue;

        if (bb === undefined) return 1;
        if (aa === '**' || aa[0] === ':') return 1;
        if (bb === '**' || bb[0] === ':') return -1;

        if (a.contentType && b.contentType) {
            const aa = a.contentType.indexOf('*');
            const bb = b.contentType.indexOf('*');

            if (aa > -1 && bb > -1) return bb - aa;
            if (aa > -1) return 1;
            if (bb > -1) return -1;
        }

        return aa.localeCompare(bb);
    }

    return -1;
}

function compare (itemParts: string[], parts: string[]): boolean {
    if (!itemParts.includes('**') && itemParts.length !== parts.length) {
        return false;
    }

    for (let i = 0; i < itemParts.length; i++) {
        if (itemParts[i] === '**') return true;
        if (itemParts[i][0] === ':') continue;
        if (itemParts[i] === parts[i]) continue;
        return false;
    }

    return true;
}

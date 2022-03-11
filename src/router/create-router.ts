import { IRouter, TAddableData } from '../types';
import { getParts, priority } from '../util/helpers';

export default function createRouter (branchData: TAddableData): IRouter {
    const routes = [...branchData.routes].sort(priority);
    const renderers = [...branchData.renderers].sort(priority);
    const errorHandlers = [...branchData.errorHandlers].sort(priority);

    function router (pathname?: string): TAddableData {
        if (pathname) {
            const parts = getParts(pathname);

            return {
                routes: routes.filter(item => compareParts(item.parts, parts)),
                renderers: renderers.filter(item => compareParts(item.parts, parts)),
                errorHandlers: errorHandlers.filter(item => compareParts(item.parts, parts))
            };
        }

        return {
            routes: [...routes],
            renderers: [...renderers],
            errorHandlers: [...errorHandlers]
        };
    }

    return router;
}

function compareParts (a: string[], b: string[]): boolean {
    if (!a.includes('**') && a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] === '**') return true;
        if (a[i][0] === ':') continue;
        if (a[i] === b[i]) continue;
        return false;
    }

    return true;
}

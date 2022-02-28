import { getParts } from './helpers';
import Ex from '../util/ex';
import { getHeader, sanitizeContentType } from '../util/sanitize';

function createRouteManager (branch: TAddableData[], bundle: TBundle): IRouteManager {
    function routeManager (pathname?: string): TRoute[] {
        if (pathname) {
            const parts = getParts(pathname);
            return branch.filter(route => compareRoute(route, parts)).map(convert);
        }

        return branch.map(convert) || [];
    }

    return routeManager;

    function convert (route: TAddableData): TRoute {
        return {
            method: route.method,
            parts: [...route.parts],
            lifecycle: createLifecycle(route)
        };
    }

    function createLifecycle (route: TAddableData): ILifecycle {
        const { res } = bundle;

        async function lifecycle (): Promise<void> {
            try {
                for (const handle of route.handles) {
                    const payload = await handle(bundle, routeManager);

                    if (payload !== undefined || res.writableEnded) {
                        await render(route, payload, bundle, routeManager);
                        break;
                    }
                }
            } catch (error: unknown) {
                const handle = route.errorHandler!;
                const payload = await handle(error, bundle, routeManager);

                if (res.statusCode === 500) {
                    console.error(error);
                }

                await render(route, payload, bundle, routeManager);
            }
        }

        return lifecycle;
    }
}

export default createRouteManager;

function compareRoute (route: TAddableData, parts: string[], method?: string): boolean {
    if (method !== undefined && method !== route.method) {
        return false;
    }

    if (!route.parts.includes('**') && route.parts.length !== parts.length) {
        return false;
    }

    for (let i = 0; i < route.parts.length; i++) {
        if (route.parts[i] === '**') return true;
        if (route.parts[i][0] === ':') continue;
        if (route.parts[i] === parts[i]) continue;
        return false;
    }

    return true;
}

async function render (route: TAddableData, payload: unknown, bundle: TBundle, routeManager: IRouteManager): Promise<void> {
    const { req, res, url, } = bundle;

    if (payload !== undefined && !res.writableEnded) {
        const contentType = getHeader(res, 'Content-Type');
        const renderer = findRenderer(route.renderers, contentType);
        await renderer(payload, bundle, routeManager);
    }

    if (!res.writableEnded) {
        throw Ex.InternalServerError('Response not finalized', {
            pathname: url.pathname,
            method: req.method
        });
    }
}

function findRenderer (renderers: TRendererData[], contentType: string): TRenderer {
    const mime = sanitizeContentType(contentType);

    const renderer = renderers.find(renderer => renderer.mime === mime);

    if (renderer) {
        return renderer.handle;
    }

    throw Ex.InternalServerError('Renderer not found', {
        contentType
    });
}

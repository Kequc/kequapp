import { getParts } from './helpers';
import Ex from '../util/ex';
import { getHeader, sanitizeContentType } from '../util/sanitize';

function createRouteManager (branch: IBranchInstance, bundle: TBundle): IRouteManager {
    function routeManager (pathname?: string): TRoute[] {
        if (pathname) {
            const parts = getParts(pathname);
            return branch().filter(route => compareRoute(route, parts)).map(convert);
        }

        return branch().map(convert);
    }

    return routeManager;

    function convert (route: TRouteData): TRoute {
        return {
            method: route.method,
            parts: route.parts,
            lifecycle: createLifecycle(route)
        };
    }

    function createLifecycle (route: TRouteData): ILifecycle {
        const { errorHandler } = route.options as TConfig;

        async function lifecycle (): Promise<void> {
            try {
                for (const handle of route.handles) {
                    const payload = await handle(bundle, routeManager);

                    if (payload !== undefined || bundle.res.writableEnded) {
                        await render(route, payload);
                        break;
                    }
                }
            } catch (error: unknown) {
                const payload = await errorHandler(error, bundle);

                if (bundle.res.statusCode === 500) {
                    console.error(error);
                }

                await render(route, payload);
            }
        }

        return lifecycle;
    }

    async function render (route: TRouteData, payload: unknown): Promise<void> {
        const { renderers } = route.options as TConfig;

        if (payload !== undefined && !bundle.res.writableEnded) {
            const contentType = getHeader(bundle.res, 'Content-Type');
            const renderer = findRenderer(renderers, contentType);
            await renderer(payload, bundle);
        }

        if (!bundle.res.writableEnded) {
            throw Ex.InternalServerError('Response not finalized', {
                pathname: bundle.url.pathname,
                method: bundle.req.method
            });
        }
    }
}

export default createRouteManager;

function compareRoute (route: TRouteData, parts: string[], method?: string): boolean {
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

function findRenderer (renderers: TRenderers, contentType: string): TRenderer {
    const key = sanitizeContentType(contentType);

    if (renderers[key]) {
        return renderers[key];
    }

    throw Ex.InternalServerError('Renderer not found', {
        contentType
    });
}

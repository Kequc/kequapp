import { TBundle, TRouteData } from '../types';

export default function cors ({ req, res }: TBundle, routes: TRouteData[]): void {
    const allowMethods = calcAllowMethods(routes);
    res.setHeader('Valid', allowMethods);
    res.setHeader('Access-Control-Allow-Methods', allowMethods);
    const allowHeaders = req.headers['access-control-request-headers'];
    if (allowHeaders) res.setHeader('Access-Control-Allow-Headers', allowHeaders);
}

function calcAllowMethods (routes: TRouteData[]): string {
    const result = new Set(routes.map(route => route.method));

    if (result.has('GET')) result.add('HEAD');
    result.add('OPTIONS');

    return [...result].join(', ');
}

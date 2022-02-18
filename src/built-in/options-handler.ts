function optionsHandler ({ req, res, url, getInfo }: TBundle): void {
    const info = getInfo(url.pathname);
    const headers = req.headers['access-control-request-headers'];
    const methods = info.map(({ method }) => method);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', headers || '*');
    res.setHeader('Access-Control-Max-Age', 86400);

    res.end();
}

export default optionsHandler;

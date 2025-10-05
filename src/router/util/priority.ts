import { getParts } from './extract.ts';

interface TSortableUrl { url: string }

export function priorityUrl(a: TSortableUrl, b: TSortableUrl): number {
    const partsa = getParts(a.url);
    const partsb = getParts(b.url);
    const count = Math.max(partsa.length, partsb.length);

    for (let i = 0; i < count; i++) {
        const aa = partsa[i];
        const bb = partsb[i];

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

    return 0;
}

interface TSortableContentType { contentType: string }

export function priorityContentType(
    a: TSortableContentType,
    b: TSortableContentType,
): number {
    const aa = a.contentType.indexOf('*');
    const bb = b.contentType.indexOf('*');

    if (aa > -1 && bb > -1) return bb - aa;
    if (aa > -1) return 1;
    if (bb > -1) return -1;

    return 0;
}

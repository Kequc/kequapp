type TSortableParts = { parts: string[] };

export function priorityParts (a: TSortableParts, b: TSortableParts): number {
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

    return 0;
}

type TSortableContentType = { contentType: string };

export function priorityContentType (a: TSortableContentType, b: TSortableContentType): number {
    const aa = a.contentType.indexOf('*');
    const bb = b.contentType.indexOf('*');

    if (aa > -1 && bb > -1) return bb - aa;
    if (aa > -1) return 1;
    if (bb > -1) return -1;

    return 0;
}

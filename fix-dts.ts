import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir: string) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
            await walk(p);
        } else if (e.isFile() && p.endsWith('.d.ts')) {
            const src = await readFile(p, 'utf8');
            // Replace only *relative* .ts specifiers with .js in import/export/dynamic-import
            const out = src
                .replace(/(from\s+['"])(\.{1,2}\/[^'"]+)\.ts(['"])/g, '$1$2.js$3')
                .replace(/(import\(\s*['"])(\.{1,2}\/[^'"]+)\.ts(['"]\s*\))/g, '$1$2.js$3')
                .replace(/(export\s+\*\s+from\s+['"])(\.{1,2}\/[^'"]+)\.ts(['"])/g, '$1$2.js$3');
            if (out !== src) await writeFile(p, out, 'utf8');
        }
    }
}

await walk('dist');

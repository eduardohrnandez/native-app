// Copies only the icons the app imports out of the free Hugeicons set: the package has no per-icon
// subpath exports, and importing its root would ship all ~15k icons in the bundle.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import * as free from "@hugeicons/core-free-icons";

const IMPORT_RE = /@app\/icons\/([a-z0-9-]+)/g;
const SOURCE_RE = /\.(ts|tsx)$/;
const LOWER_UPPER_RE = /([a-z0-9])([A-Z])/g;
const UPPER_RUN_RE = /([A-Z])([A-Z][a-z])/g;
const SKIP = new Set(["node_modules", ".expo", ".intlayer", "ios", "android", "dist"]);

const root = join(import.meta.dirname, "..");
const appSrc = join(root, "../../apps/native");
const out = join(root, "src");

export function toKebab(name) {
    return name.replaceAll(UPPER_RUN_RE, "$1-$2").replaceAll(LOWER_UPPER_RE, "$1-$2").toLowerCase();
}

const catalog = new Map(Object.entries(free).map(([name, data]) => [toKebab(name), data]));

function walk(dir, found) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(entry.name)) {
            continue;
        }
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(path, found);
        } else if (SOURCE_RE.test(entry.name)) {
            for (const match of readFileSync(path, "utf-8").matchAll(IMPORT_RE)) {
                found.add(match[1]);
            }
        }
    }
    return found;
}

const slugs = [...walk(appSrc, new Set())].filter((slug) => slug !== "types").toSorted();
const missing = slugs.filter((slug) => !Array.isArray(catalog.get(slug)));
if (missing.length > 0) {
    throw new Error(`Not in the free Hugeicons set: ${missing.join(", ")}`);
}

if (existsSync(out)) {
    rmSync(out, { recursive: true });
}
mkdirSync(out);
writeFileSync(
    join(out, "types.ts"),
    "export type IconSvgObject = readonly (readonly [string, Readonly<Record<string, string | number>>])[];\n"
);
for (const slug of slugs) {
    const data = JSON.stringify(catalog.get(slug));
    writeFileSync(
        join(out, `${slug}.ts`),
        `import type { IconSvgObject } from "./types.ts";\n\nconst icon: IconSvgObject = ${data};\n\nexport default icon;\n`
    );
}
console.log(`Generated ${slugs.length} icons`);

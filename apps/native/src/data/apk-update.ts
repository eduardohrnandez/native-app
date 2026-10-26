import { z } from "zod";

// The APK workflow tags each release `apk-<run>` and stamps the same run as the versionCode, so the two compare.
const TAG_PATTERN = /^apk-(\d+)$/;
const APK_SUFFIX = ".apk";

const releaseList = z.array(
    z
        .object({
            assets: z.array(z.object({ browser_download_url: z.string().url(), name: z.string() })),
            draft: z.boolean(),
            html_url: z.string().url(),
            tag_name: z.string(),
        })
        .nullable()
        .catch(null)
);

/** Raw JSON as the GitHub API sends it; `releaseList` is the parse step. */
export type GithubPayload =
    | string
    | number
    | boolean
    | null
    | readonly GithubPayload[]
    | { readonly [key: string]: GithubPayload };

export interface ApkRelease {
    build: number;
    downloadUrl: string;
}

/** The newest published APK strictly newer than the installed build, or null when this one is current. */
export function newerApk(payload: unknown, installedBuild: number): ApkRelease | null {
    const parsed = releaseList.safeParse(payload);
    if (!parsed.success) {
        return null;
    }
    let newest: ApkRelease | null = null;
    for (const release of parsed.data) {
        const match = release === null || release.draft ? null : TAG_PATTERN.exec(release.tag_name);
        const apk = release?.assets.find((asset) => asset.name.endsWith(APK_SUFFIX));
        if (match === null || release === null || apk === undefined) {
            continue;
        }
        const build = Number.parseInt(match[1] ?? "", 10);
        if (build > installedBuild && (newest === null || build > newest.build)) {
            newest = { build, downloadUrl: apk.browser_download_url };
        }
    }
    return newest;
}

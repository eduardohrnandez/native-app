import { describe, expect, it } from "@jest/globals";

import { newerApk } from "./apk-update";

function release(tag: string, options: { apk?: boolean; draft?: boolean } = {}) {
    return {
        assets:
            options.apk === false
                ? []
                : [
                      {
                          browser_download_url: `https://github.com/x/y/releases/download/${tag}/finta.apk`,
                          name: "finta.apk",
                      },
                  ],
        draft: options.draft ?? false,
        html_url: `https://github.com/x/y/releases/tag/${tag}`,
        tag_name: tag,
    };
}

describe("newerApk", () => {
    it("offers the highest build above the installed one, whatever the list order", () => {
        const result = newerApk([release("apk-7"), release("apk-9"), release("apk-8")], 7);
        expect(result?.build).toBe(9);
        expect(result?.downloadUrl).toContain("apk-9");
    });

    it("offers nothing when the installed build is already the newest", () => {
        expect(newerApk([release("apk-7"), release("apk-6")], 7)).toBeNull();
    });

    it("skips drafts, releases without an APK and tags it did not publish", () => {
        const payload = [
            release("apk-10", { draft: true }),
            release("apk-11", { apk: false }),
            release("v12"),
            release("apk-8"),
        ];
        expect(newerApk(payload, 7)?.build).toBe(8);
    });

    it("answers nothing for an API error body", () => {
        expect(newerApk({ message: "API rate limit exceeded" }, 1)).toBeNull();
    });
});

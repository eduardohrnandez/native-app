import { describe, expect, it } from "@jest/globals";

import { newerApks } from "./apk-update";

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

describe("newerApks", () => {
    it("lists builds above the installed one newest first, whatever the list order", () => {
        const result = newerApks([release("apk-7"), release("apk-9"), release("apk-8")], 7);
        expect(result.map((apk) => apk.build)).toStrictEqual([9, 8]);
        expect(result[0]?.downloadUrl).toContain("apk-9");
    });

    it("offers nothing when the installed build is already the newest", () => {
        expect(newerApks([release("apk-7"), release("apk-6")], 7)).toStrictEqual([]);
    });

    it("skips drafts, releases without an APK and tags it did not publish", () => {
        const payload = [
            release("apk-10", { draft: true }),
            release("apk-11", { apk: false }),
            release("v12"),
            release("apk-8"),
        ];
        expect(newerApks(payload, 7).map((apk) => apk.build)).toStrictEqual([8]);
    });

    it("answers nothing for an API error body", () => {
        expect(newerApks({ message: "API rate limit exceeded" }, 1)).toStrictEqual([]);
    });
});

import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

// One GitHub call per window serves every phone: unauthenticated GitHub allows 60 calls an hour per IP.
const RELEASES_URL = "https://api.github.com/repos/eduardohrnandez/native-pp/releases?per_page=30";
const CACHE_WINDOW_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

export const cachedReleases = internalQuery({
    args: {},
    handler: async (ctx) => await ctx.db.query("appReleaseCache").first(),
});

export const storeReleases = internalMutation({
    args: { body: v.string(), fetchedAt: v.number() },
    handler: async (ctx, args) => {
        const current = await ctx.db.query("appReleaseCache").first();
        if (current === null) {
            await ctx.db.insert("appReleaseCache", { body: args.body, fetchedAt: args.fetchedAt });
            return;
        }
        await ctx.db.patch(current._id, { body: args.body, fetchedAt: args.fetchedAt });
    },
});

/** The raw GitHub releases JSON, as text, served from a cache refreshed at most every ten minutes. */
export const latest = action({
    args: {},
    handler: async (ctx): Promise<string> => {
        const cached = await ctx.runQuery(internal.appUpdates.cachedReleases, {});
        const now = Date.now();
        if (cached !== null && now - cached.fetchedAt < CACHE_WINDOW_MS) {
            return cached.body;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const response = await fetch(RELEASES_URL, {
                headers: { Accept: "application/vnd.github+json", "User-Agent": "finta-app" },
                signal: controller.signal,
            });
            if (!response.ok) {
                // A stale copy beats a failed check for every phone that asks in the meantime.
                if (cached !== null) {
                    return cached.body;
                }
                throw new ConvexError(`GitHub releases answered ${response.status}`);
            }
            const body = await response.text();
            await ctx.runMutation(internal.appUpdates.storeReleases, { body, fetchedAt: now });
            return body;
        } finally {
            clearTimeout(timer);
        }
    },
});

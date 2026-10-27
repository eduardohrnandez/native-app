import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

const EMPTY_LIST = "[]";

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

/**
 * The release list the APK workflow last pushed, as the raw JSON text. It never calls GitHub: a refresh that hangs
 * would hold every phone on "Checking", and the workflow already sends the list after each build.
 */
export const latest = action({
    args: {},
    handler: async (ctx): Promise<string> => {
        const cached = await ctx.runQuery(internal.appUpdates.cachedReleases, {});
        return cached?.body ?? EMPTY_LIST;
    },
});

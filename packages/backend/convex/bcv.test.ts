/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

function stubFetch(payload: unknown, ok = true) {
    const response = { json: () => Promise.resolve(payload), ok, status: ok ? 200 : 500 };
    vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(response))
    );
}

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("bcv.fetchRates", () => {
    it("stores the official dollar and the euro as bolivares per unit", async () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-26T18:00:00Z"));
        const t = convexTest(schema, modules);
        stubFetch({ rates: { eur: 747.33, usd: 652.97 }, updatedAt: 1_793_000_000_000 });

        await t.action(internal.bcv.fetchRates, {});

        const rows = await t.run((ctx) => ctx.db.query("exchangeRates").collect());
        const byType = new Map(rows.map((row) => [row.rateType, row]));
        expect(rows.filter((row) => row.date === "2026-10-26")).toHaveLength(2);
        expect(byType.get("official")).toMatchObject({ quote: "VES", rate: 652.97, source: "bcv" });
        expect(byType.get("eur_reference")).toMatchObject({ quote: "VES", rate: 747.33, source: "bcv" });
    });

    it("covers the previous day for Caracas without rewriting a rate already recorded there", async () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-27T02:00:00Z"));
        const t = convexTest(schema, modules);
        await t.run(async (ctx) => {
            await ctx.db.insert("exchangeRates", {
                date: "2026-10-26",
                fetchedAt: 1,
                quote: "VES",
                rate: 600,
                rateType: "official",
                source: "bcv",
            });
        });
        stubFetch({ rates: { eur: 747.33, usd: 652.97 } });

        await t.action(internal.bcv.fetchRates, {});

        const rows = await t.run((ctx) => ctx.db.query("exchangeRates").collect());
        const yesterday = rows.filter((row) => row.date === "2026-10-26");
        expect(yesterday.find((row) => row.rateType === "official")?.rate).toBe(600);
        expect(yesterday.find((row) => row.rateType === "eur_reference")?.rate).toBe(747.33);
        expect(rows.find((row) => row.date === "2026-10-27" && row.rateType === "official")?.rate).toBe(652.97);
    });

    it("writes nothing when the feed sends a non-positive rate or fails", async () => {
        vi.spyOn(console, "error").mockReturnValue(undefined);
        const t = convexTest(schema, modules);

        stubFetch({ rates: { eur: 0, usd: 652.97 } });
        await t.action(internal.bcv.fetchRates, {});
        stubFetch({}, false);
        await t.action(internal.bcv.fetchRates, {});

        await expect(t.run((ctx) => ctx.db.query("exchangeRates").collect())).resolves.toHaveLength(0);
    });
});

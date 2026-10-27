import { v } from "convex/values";
import { z } from "zod";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { utcDateString } from "./lib/currencies";

// Free and keyless, the same feed Mak3D Hub reads: the official BCV dollar and euro, in bolívares each.
const BCV_URL = "https://bcv.justcarlux.dev/api/v1/rates";
const RATES_TIMEOUT_MS = 20_000;
const MS_PER_DAY = 86_400_000;

const VES_QUOTE = "VES";

const bcvResponse = z.object({
    rates: z.object({
        eur: z.number().finite().positive(),
        usd: z.number().finite().positive(),
    }),
});

export const fetchRates = internalAction({
    args: {},
    handler: async (ctx) => {
        let payload: unknown;
        try {
            const response = await fetch(BCV_URL, {
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(RATES_TIMEOUT_MS),
            });
            if (!response.ok) {
                console.error(`BCV rates fetch failed with HTTP ${response.status}`);
                return null;
            }
            payload = await response.json();
        } catch (error) {
            console.error("BCV rates fetch request failed", error);
            return null;
        }

        const contract = bcvResponse.safeParse(payload);
        if (!contract.success) {
            console.error("BCV rates response did not carry positive usd and eur values");
            return null;
        }

        const fetchedAt = Date.now();
        const rates = [
            { quote: VES_QUOTE, rate: contract.data.rates.usd, rateType: "official" as const },
            { quote: VES_QUOTE, rate: contract.data.rates.eur, rateType: "eur_reference" as const },
        ];
        await ctx.runMutation(internal.exchangeRates.upsertRates, {
            date: utcDateString(fetchedAt),
            fetchedAt,
            rates,
            source: "bcv",
        });
        // Caracas is four hours behind UTC, so from 8 p.m. an entry dated "today" there is yesterday here.
        await ctx.runMutation(internal.exchangeRates.insertRatesIfMissing, {
            date: utcDateString(fetchedAt - MS_PER_DAY),
            fetchedAt,
            rates,
            source: "bcv",
        });
        return null;
    },
    returns: v.null(),
});

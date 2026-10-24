import { describe, expect, it } from "@jest/globals";

import type { DolarApiPayload } from "./public-rates";
import { fetchPublicVesRates, mergeRates, parseBcvRates, parseCurrentQuote, parseHistory } from "./public-rates";

const NOW = Date.parse("2026-10-24T12:00:00Z");

describe("parseBcvRates", () => {
    it("dates the rate by the Caracas day, not the UTC one", () => {
        // 22:30 in Caracas on the 23rd is already the 24th in UTC.
        const rows = parseBcvRates(
            { rates: { eur: 245.1, usd: 210.4 }, updatedAt: Date.parse("2026-10-24T02:30:00Z") },
            NOW
        );
        expect(rows.map((row) => `${row.rateType}:${row.date}:${row.rate}`)).toStrictEqual([
            "official:2026-10-23:210.4",
            "eur_reference:2026-10-23:245.1",
        ]);
    });

    it("drops the reply when either rate is missing or not positive", () => {
        expect(parseBcvRates({ rates: { eur: 0, usd: 210 }, updatedAt: NOW }, NOW)).toStrictEqual([]);
        expect(parseBcvRates({ rates: { usd: 210 }, updatedAt: NOW }, NOW)).toStrictEqual([]);
    });
});

describe("parseCurrentQuote", () => {
    it("reads the BCV average and the calendar day it was published", () => {
        const row = parseCurrentQuote(
            { fechaActualizacion: "2026-10-23T20:05:00.000Z", fuente: "oficial", promedio: 210.45 },
            "official",
            NOW
        );
        expect(row).toStrictEqual({
            date: "2026-10-23",
            fetchedAt: NOW,
            quote: "VES",
            rate: 210.45,
            rateType: "official",
            source: "dolarapi",
        });
    });

    it("rejects a missing, zero or negative rate so a bad feed never prices an entry", () => {
        expect(parseCurrentQuote({ fechaActualizacion: "2026-10-23", promedio: 0 }, "official", NOW)).toBeNull();
        expect(parseCurrentQuote({ fechaActualizacion: "2026-10-23", promedio: -5 }, "official", NOW)).toBeNull();
        expect(parseCurrentQuote({ fechaActualizacion: "2026-10-23" }, "official", NOW)).toBeNull();
        expect(parseCurrentQuote({ fechaActualizacion: "ayer", promedio: 210 }, "official", NOW)).toBeNull();
    });
});

describe("parseHistory", () => {
    it("keeps one row per day and drops malformed days instead of the whole history", () => {
        const rows = parseHistory(
            [
                { fecha: "2026-10-21", promedio: 205 },
                { fecha: "2026-10-22", promedio: "x" },
                { fecha: "2026-10-23", promedio: 208 },
                { fecha: "2026-10-23T23:00:00Z", promedio: 209 },
            ],
            "eur_reference",
            NOW
        );
        expect(rows.map((row) => [row.date, row.rate])).toStrictEqual([
            ["2026-10-21", 205],
            ["2026-10-23", 209],
        ]);
        expect(rows.every((row) => row.rateType === "eur_reference" && row.quote === "VES")).toBeTruthy();
    });

    it("answers nothing for a payload that is not a list", () => {
        expect(parseHistory({ error: "down" }, "official", NOW)).toStrictEqual([]);
    });
});

describe("mergeRates", () => {
    it("lets the current quote replace the history row for the same day", () => {
        const history = parseHistory([{ fecha: "2026-10-23", promedio: 208 }], "official", NOW);
        const current = parseCurrentQuote({ fechaActualizacion: "2026-10-23", promedio: 210 }, "official", NOW);
        expect(mergeRates(history, [current]).map((row) => row.rate)).toStrictEqual([210]);
    });
});

describe("fetchPublicVesRates", () => {
    it("prefers BCV Rates over DolarApi for the same day and keeps DolarApi's history", async () => {
        const fetchFn = async (url: string): Promise<DolarApiPayload> => {
            if (url.includes("justcarlux")) {
                return { rates: { eur: 246, usd: 211 }, updatedAt: Date.parse("2026-10-23T20:00:00Z") };
            }
            const rate = url.includes("euros") ? 245 : 210;
            return url.includes("historicos")
                ? [{ fecha: "2026-10-22", promedio: rate - 1 }]
                : { fechaActualizacion: "2026-10-23", promedio: rate };
        };
        const rows = await fetchPublicVesRates(fetchFn, NOW);
        expect(rows.map((row) => `${row.rateType}:${row.date}:${row.rate}`).toSorted()).toStrictEqual([
            "eur_reference:2026-10-22:244",
            "eur_reference:2026-10-23:246",
            "official:2026-10-22:209",
            "official:2026-10-23:211",
        ]);
    });

    it("still returns the dollar when BCV Rates and the euro feed are down", async () => {
        const fetchFn = async (url: string): Promise<DolarApiPayload> => {
            if (url.includes("euros") || url.includes("justcarlux")) {
                throw new Error("offline");
            }
            return url.includes("historicos")
                ? [{ fecha: "2026-10-22", promedio: 207 }]
                : { fechaActualizacion: "2026-10-23", promedio: 210 };
        };
        const rows = await fetchPublicVesRates(fetchFn, NOW);
        expect(rows.map((row) => `${row.rateType}:${row.date}:${row.rate}`).toSorted()).toStrictEqual([
            "official:2026-10-22:207",
            "official:2026-10-23:210",
        ]);
    });
});

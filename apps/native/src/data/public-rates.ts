import { z } from "zod";

import { getMeta, setMeta } from "@/data/app-meta-core";
import { applyRecentRates, isThrottled } from "@/data/rates";
import type { RateWireRow } from "@/data/rates";
import type { Database } from "@/db/client";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

// Both feeds are keyless, so a build without an account service still prices VES. BCV Rates is the
// one Mak3D Hub already trusts for the day's rate; DolarApi adds the history and stands in when it is down.
const BCV_RATES_URL = "https://bcv.justcarlux.dev/api/v1/rates";
const BCV_RATES_SOURCE = "bcv-rates";
const BASE_URL = "https://ve.dolarapi.com/v1";
const SOURCE = "dolarapi";
// Venezuela has no DST, so the BCV's calendar day is a fixed offset from UTC.
const CARACAS_OFFSET_MS = -4 * 60 * 60 * 1000;
const VES = "VES";
const TIMEOUT_MS = 15_000;
const LAST_PULL_KEY = "lastPublicRatesPullAt";
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

const FEEDS = [
    { current: "dolares/oficial", history: "historicos/dolares/oficial", rateType: "official" },
    { current: "euros/oficial", history: "historicos/euros/oficial", rateType: "eur_reference" },
] as const;

/** Raw JSON as DolarApi sends it; the zod schemas below are the parse step. */
export type DolarApiPayload =
    | string
    | number
    | boolean
    | null
    | readonly DolarApiPayload[]
    | { readonly [key: string]: DolarApiPayload };

const positiveRate = z.number().finite().positive();

const bcvRates = z.object({
    rates: z.object({ eur: positiveRate, usd: positiveRate }),
    updatedAt: z.number().finite().positive(),
});

const currentQuote = z.object({ fechaActualizacion: z.string(), promedio: positiveRate });

// One malformed day is dropped, not the whole history.
const historyQuotes = z.array(z.object({ fecha: z.string(), promedio: positiveRate }).nullable().catch(null));

function calendarDate(raw: string): string | null {
    const match = DATE_PREFIX.exec(raw.trim());
    return match ? match[0] : null;
}

export function parseCurrentQuote(payload: DolarApiPayload, rateType: string, fetchedAt: number): RateWireRow | null {
    const parsed = currentQuote.safeParse(payload);
    if (!parsed.success) {
        return null;
    }
    const date = calendarDate(parsed.data.fechaActualizacion);
    return date === null ? null : { date, fetchedAt, quote: VES, rate: parsed.data.promedio, rateType, source: SOURCE };
}

export function parseHistory(payload: DolarApiPayload, rateType: string, fetchedAt: number): RateWireRow[] {
    const parsed = historyQuotes.safeParse(payload);
    if (!parsed.success) {
        return [];
    }
    // The feed keeps the last value of each day, but a repeated day still keeps only its final row.
    const byDate = new Map<string, RateWireRow>();
    for (const entry of parsed.data) {
        const date = entry === null ? null : calendarDate(entry.fecha);
        if (entry === null || date === null) {
            continue;
        }
        byDate.set(date, { date, fetchedAt, quote: VES, rate: entry.promedio, rateType, source: SOURCE });
    }
    return [...byDate.values()];
}

export function parseBcvRates(payload: DolarApiPayload, fetchedAt: number): RateWireRow[] {
    const parsed = bcvRates.safeParse(payload);
    if (!parsed.success) {
        return [];
    }
    const date = new Date(parsed.data.updatedAt + CARACAS_OFFSET_MS).toISOString().slice(0, "YYYY-MM-DD".length);
    const { eur, usd } = parsed.data.rates;
    return [
        { date, fetchedAt, quote: VES, rate: usd, rateType: "official", source: BCV_RATES_SOURCE },
        { date, fetchedAt, quote: VES, rate: eur, rateType: "eur_reference", source: BCV_RATES_SOURCE },
    ];
}

/** The current quote wins over a history row for the same day: it is the newer publication. */
export function mergeRates(history: readonly RateWireRow[], current: readonly (RateWireRow | null)[]): RateWireRow[] {
    const merged = new Map<string, RateWireRow>();
    for (const row of [...history, ...current]) {
        if (row !== null) {
            merged.set(`${row.rateType}:${row.date}`, row);
        }
    }
    return [...merged.values()];
}

type FetchJson = (url: string) => Promise<DolarApiPayload>;

async function fetchJson(url: string): Promise<DolarApiPayload> {
    const response = await fetchWithTimeout(url, {}, TIMEOUT_MS);
    if (!response.ok) {
        throw new Error(`DolarApi answered HTTP ${response.status} for ${url}`);
    }
    const body: DolarApiPayload = await response.json();
    return body;
}

// A feed that fails yields nothing, so one dead endpoint never blocks the other.
export async function fetchPublicVesRates(fetchFn: FetchJson = fetchJson, now = Date.now()): Promise<RateWireRow[]> {
    const [primary, ...fallback] = await Promise.allSettled([
        fetchFn(BCV_RATES_URL).then((payload) => parseBcvRates(payload, now)),
        ...FEEDS.map(async ({ current, history, rateType }) => {
            const [currentPayload, historyPayload] = await Promise.allSettled([
                fetchFn(`${BASE_URL}/${current}`),
                fetchFn(`${BASE_URL}/${history}`),
            ]);
            return mergeRates(
                historyPayload.status === "fulfilled" ? parseHistory(historyPayload.value, rateType, now) : [],
                [currentPayload.status === "fulfilled" ? parseCurrentQuote(currentPayload.value, rateType, now) : null]
            );
        }),
    ]);
    const dolarApi = fallback.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    return mergeRates(dolarApi, primary.status === "fulfilled" ? primary.value : []);
}

/** Upserts, never wipes: days already stored stay, so entries dated before the feed's window keep their rate. */
export async function refreshPublicRates(
    db: Database,
    options: { fetchFn?: FetchJson; force?: boolean; now?: number } = {}
): Promise<boolean> {
    const now = options.now ?? Date.now();
    const raw = await getMeta(db, LAST_PULL_KEY);
    const last = raw === null ? null : Number.parseInt(raw, 10);
    if (!options.force && isThrottled(last === null || Number.isNaN(last) ? null : last, now)) {
        return false;
    }
    const rows = await fetchPublicVesRates(options.fetchFn, now);
    if (rows.length === 0) {
        return false;
    }
    const changed = await applyRecentRates(db, rows);
    await setMeta(db, LAST_PULL_KEY, String(now));
    return changed;
}

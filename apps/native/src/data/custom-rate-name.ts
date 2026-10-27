import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { appMeta } from "@/db/schema";

import { META_KEYS, setMeta } from "./app-meta-core";
import { useLiveValue } from "./live-query";

export const CUSTOM_RATE_NAME_LIMIT = 24;

/** The user's name for the typed rate, or null to fall back to the translated default. */
export function useCustomRateName(db: Database | null): string | null {
    return useLiveValue(
        appMeta,
        () =>
            db === null
                ? { all: (): { value: string | null }[] => [] }
                : db.select({ value: appMeta.value }).from(appMeta).where(eq(appMeta.key, META_KEYS.customRateName)),
        (rows) => cleanRateName(rows[0]?.value ?? null),
        [db]
    );
}

export function cleanRateName(raw: string | null): string | null {
    const trimmed = raw?.trim().slice(0, CUSTOM_RATE_NAME_LIMIT) ?? "";
    return trimmed === "" ? null : trimmed;
}

export async function saveCustomRateName(db: Database, name: string): Promise<void> {
    await setMeta(db, META_KEYS.customRateName, name.slice(0, CUSTOM_RATE_NAME_LIMIT));
}

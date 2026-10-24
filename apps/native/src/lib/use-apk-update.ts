import { useEffect } from "react";
import { Linking, Platform } from "react-native";

import { newerApk } from "@/data/apk-update";
import type { GithubPayload } from "@/data/apk-update";
import { getMeta, setMeta } from "@/data/app-meta-core";
import { isThrottled } from "@/data/rates";
import type { Database } from "@/db/client";
import { translateNow } from "@/i18n/runtime";
import { APP_BUILD } from "@/lib/app-version";
import { notifyWarning } from "@/lib/notify";

// Unauthenticated GitHub allows 60 calls an hour per IP, so a check every 12 hours never trips it.
const RELEASES_URL = "https://api.github.com/repos/eduardohrnandez/native-pp/releases?per_page=10";
const LAST_CHECK_KEY = "lastApkUpdateCheckAt";
const TIMEOUT_MS = 15_000;

async function checkForApk(db: Database): Promise<void> {
    const installed = Number.parseInt(APP_BUILD, 10);
    // A build without a versionCode came from a local run, not the release workflow.
    if (Number.isNaN(installed)) {
        return;
    }
    const now = Date.now();
    const raw = await getMeta(db, LAST_CHECK_KEY);
    const last = raw === null ? Number.NaN : Number.parseInt(raw, 10);
    if (isThrottled(Number.isNaN(last) ? null : last, now)) {
        return;
    }
    const response = await fetch(RELEASES_URL, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
        return;
    }
    const body: GithubPayload = await response.json();
    await setMeta(db, LAST_CHECK_KEY, String(now));
    const update = newerApk(body, installed);
    if (update === null) {
        return;
    }
    notifyWarning({
        actionLabel: translateNow("update.download"),
        body: translateNow("update.availableBody"),
        onActionPress: () => {
            Linking.openURL(update.downloadUrl).catch((error) => {
                console.warn("[finta] could not open the APK download", error);
            });
        },
        title: translateNow("update.availableTitle"),
    });
}

/** Sideloaded Android builds have no store to update them, so the app looks for a newer release itself. */
export function useApkUpdate(db: Database | null): void {
    useEffect(() => {
        if (db == null || Platform.OS !== "android") {
            return;
        }
        checkForApk(db).catch((error) => {
            console.warn("[finta] APK update check failed", error);
        });
    }, [db]);
}

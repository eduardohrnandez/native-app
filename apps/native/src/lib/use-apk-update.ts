import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";

import { newerApk } from "@/data/apk-update";
import type { GithubPayload } from "@/data/apk-update";
import { getMeta, setMeta } from "@/data/app-meta-core";
import { isThrottled } from "@/data/rates";
import type { Database } from "@/db/client";
import { translateNow } from "@/i18n/runtime";
import { installApk } from "@/lib/apk-install";
import { APP_BUILD } from "@/lib/app-version";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { notifyWarning } from "@/lib/notify";

// Unauthenticated GitHub allows 60 calls an hour per IP, so a check every 12 hours never trips it. The list is not
// strictly newest first, so it takes a full page and `newerApk` picks the highest build.
const RELEASES_URL = "https://api.github.com/repos/eduardohrnandez/native-pp/releases?per_page=100";
const LAST_CHECK_KEY = "lastApkUpdateCheckAt";
const TIMEOUT_MS = 15_000;

// One download at a time, shared by the toast and the Settings row so both show the same progress.
let downloadProgress: number | null = null;
const listeners = new Set<() => void>();

function setDownloadProgress(next: number | null): void {
    downloadProgress = next;
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** 0 to 1 while an update downloads, null otherwise. */
export function useApkDownloadProgress(): number | null {
    return useSyncExternalStore(subscribe, () => downloadProgress);
}

export function startApkInstall(url: string): void {
    if (downloadProgress !== null) {
        return;
    }
    setDownloadProgress(0);
    notifyWarning({ body: translateNow("update.downloadingBody"), title: translateNow("update.downloading") });
    installApk(url, setDownloadProgress)
        .catch((error) => {
            console.warn("[finta] could not install the update", error);
        })
        .finally(() => setDownloadProgress(null));
}

export type ApkCheck = "available" | "current" | "failed" | "skipped";

/** `force` is the user asking from Settings: it skips the 12-hour wait and still offers the download. */
export async function checkForApk(db: Database, force = false): Promise<ApkCheck> {
    const installed = Number.parseInt(APP_BUILD, 10);
    // A build without a versionCode came from a local run, not the release workflow.
    if (Number.isNaN(installed)) {
        return "skipped";
    }
    const now = Date.now();
    const raw = await getMeta(db, LAST_CHECK_KEY);
    const last = raw === null ? Number.NaN : Number.parseInt(raw, 10);
    if (!force && isThrottled(Number.isNaN(last) ? null : last, now)) {
        return "skipped";
    }
    let body: GithubPayload;
    try {
        const response = await fetchWithTimeout(
            RELEASES_URL,
            { headers: { Accept: "application/vnd.github+json" } },
            TIMEOUT_MS
        );
        if (!response.ok) {
            return "failed";
        }
        body = await response.json();
    } catch {
        return "failed";
    }
    await setMeta(db, LAST_CHECK_KEY, String(now));
    const update = newerApk(body, installed);
    if (update === null) {
        return "current";
    }
    notifyWarning({
        actionLabel: translateNow("update.download"),
        body: translateNow("update.availableBody"),
        onActionPress: () => {
            startApkInstall(update.downloadUrl);
        },
        title: translateNow("update.availableTitle"),
    });
    return "available";
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

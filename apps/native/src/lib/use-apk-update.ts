import { useEffect, useSyncExternalStore } from "react";
import { Alert, Platform } from "react-native";

import { newerApks } from "@/data/apk-update";
import type { GithubPayload } from "@/data/apk-update";
import type { Database } from "@/db/client";
import { translateNow } from "@/i18n/runtime";
import { installApk } from "@/lib/apk-install";
import { APP_BUILD } from "@/lib/app-version";
import { cloudAction, convex } from "@/lib/convex";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { notifyWarning } from "@/lib/notify";

// Phones ask Convex, which asks GitHub at most every ten minutes, so no phone count reaches GitHub's 60-an-hour limit.
// Without a backend the app asks GitHub directly, where the list is not strictly newest first: it takes the whole page.
const RELEASES_URL = "https://api.github.com/repos/eduardohrnandez/native-pp/releases?per_page=30";
const TIMEOUT_MS = 15_000;
const NOT_FOUND = 404;
const PROBE_LIMIT = 3;

// One download at a time, shared by the alert and the Settings row so both show the same progress.
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

async function fetchReleases(): Promise<GithubPayload> {
    if (convex !== null) {
        const raw = await cloudAction<Record<string, never>, string>("appUpdates:latest", {});
        return JSON.parse(raw);
    }
    const response = await fetchWithTimeout(
        RELEASES_URL,
        { headers: { Accept: "application/vnd.github+json" } },
        TIMEOUT_MS
    );
    if (!response.ok) {
        throw new Error(`GitHub releases answered ${response.status}`);
    }
    return await response.json();
}

/** Asks for a newer build every time, so the offer comes back on each launch until the phone is updated. */
export async function checkForApk(): Promise<ApkCheck> {
    const installed = Number.parseInt(APP_BUILD, 10);
    // A build without a versionCode came from a local run, not the release workflow.
    if (Number.isNaN(installed)) {
        return "skipped";
    }
    let body: GithubPayload;
    try {
        body = await fetchReleases();
    } catch {
        return "failed";
    }
    const candidates = newerApks(body, installed);
    if (candidates.length === 0) {
        return "current";
    }
    const reachable = await firstReachable(candidates.map((candidate) => candidate.downloadUrl));
    if (reachable === null) {
        return "current";
    }
    offerInstall(reachable);
    return "available";
}

// The release list can name a build that was deleted since it was cached, so a dead link falls to the next one.
// A network failure counts as reachable: the download itself reports it, and a flaky probe must not hide an update.
async function isReachable(url: string): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(url, { method: "HEAD" }, TIMEOUT_MS);
        return response.status !== NOT_FOUND;
    } catch {
        return true;
    }
}

async function firstReachable(urls: readonly string[]): Promise<string | null> {
    const probed = urls.slice(0, PROBE_LIMIT);
    const alive = await Promise.all(probed.map(isReachable));
    return probed.find((_, index) => alive[index]) ?? null;
}

// "Después" dismisses for this launch only: nothing is stored, so the next launch offers again.
function offerInstall(url: string): void {
    Alert.alert(translateNow("update.availableTitle"), translateNow("update.availableBody"), [
        { style: "cancel", text: translateNow("update.later") },
        { onPress: () => startApkInstall(url), text: translateNow("update.now") },
    ]);
}

/** Sideloaded Android builds have no store to update them, so the app looks for a newer release itself. */
export function useApkUpdate(db: Database | null): void {
    useEffect(() => {
        if (db == null || Platform.OS !== "android") {
            return;
        }
        checkForApk().catch((error) => {
            console.warn("[finta] APK update check failed", error);
        });
    }, [db]);
}

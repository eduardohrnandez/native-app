import { File, Paths } from "expo-file-system";
import { Linking } from "react-native";

import type { installApk as sharedInstallApk } from "@/lib/apk-install";

const APK_NAME = "finta-update.apk";
const APK_MIME = "application/vnd.android.package-archive";
// Intent.FLAG_GRANT_READ_URI_PERMISSION: the installer reads the file through Finta's content provider.
const GRANT_READ_URI = 1;

async function downloadAndOpen(url: string, onProgress: (fraction: number) => void): Promise<void> {
    const destination = new File(Paths.cache, APK_NAME);
    if (destination.exists) {
        destination.delete();
    }
    const task = File.createDownloadTask(url, destination, {
        onProgress: ({ bytesWritten, totalBytes }) => {
            if (totalBytes > 0) {
                onProgress(bytesWritten / totalBytes);
            }
        },
    });
    const file = await task.downloadAsync();
    if (file === null) {
        throw new Error("The APK download was paused before it finished");
    }
    // Required lazily, like the language page: both load native modules on import.
    // SAFETY: untyped `require`, asserted to that module's own type.
    const { getContentUriAsync } = require("expo-file-system/legacy") as typeof import("expo-file-system/legacy");
    // SAFETY: untyped `require`, asserted to that module's own type.
    const { startActivityAsync } = require("expo-intent-launcher") as typeof import("expo-intent-launcher");
    const contentUri = await getContentUriAsync(file.uri);
    await startActivityAsync("android.intent.action.VIEW", { data: contentUri, flags: GRANT_READ_URI, type: APK_MIME });
}

/** Downloads the APK inside Finta and hands it to the system installer; the browser is only the fallback. */
export const installApk: typeof sharedInstallApk = async (url, onProgress) => {
    try {
        await downloadAndOpen(url, onProgress);
    } catch (error) {
        console.warn("[finta] in-app APK install failed, opening the browser", error);
        await Linking.openURL(url);
    }
};

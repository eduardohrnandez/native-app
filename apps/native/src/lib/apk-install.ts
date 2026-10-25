import { Linking } from "react-native";

export type InstallProgress = number | null;

/** iOS never sideloads, so a link is all there is; Android downloads in place (`apk-install.android.ts`). */
export async function installApk(url: string, _onProgress: (fraction: number) => void): Promise<void> {
    await Linking.openURL(url);
}

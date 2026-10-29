import { launchCameraAsync as realLaunchCamera, launchImageLibraryAsync as realLaunchLibrary } from "expo-image-picker/build/ImagePicker";
import type { ImagePickerOptions, ImagePickerResult } from "expo-image-picker/build/ImagePicker";

import { adoptBlob } from "./file-system";

export * from "expo-image-picker/build/ImagePicker";

// File reads are synchronous in the app, so the chosen picture's bytes are fetched before the picker returns.
async function load(result: ImagePickerResult): Promise<ImagePickerResult> {
    if (!result.canceled) {
        await Promise.all(result.assets.map((asset) => adoptBlob(asset.uri)));
    }
    return result;
}

export async function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult> {
    return await load(await realLaunchLibrary(options));
}

export async function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult> {
    return await load(await realLaunchCamera(options));
}

import { Image as RealImage } from "expo-image/build/index";
import type { ImageProps } from "expo-image/build/index";

import { objectUrlFor } from "./file-system";

export * from "expo-image/build/index";

type Source = ImageProps["source"];

function resolveSource(source: Source): Source {
    if (typeof source === "object" && source !== null && !Array.isArray(source) && "uri" in source) {
        const url = typeof source.uri === "string" ? objectUrlFor(source.uri) : null;
        return url === null ? source : { ...source, uri: url };
    }
    return source;
}

// Photos live in the browser file system, which an image element cannot open by their file:// address.
export function Image(props: ImageProps) {
    return <RealImage {...props} source={resolveSource(props.source)} />;
}
Image.prefetch = RealImage.prefetch;
Image.clearMemoryCache = RealImage.clearMemoryCache;
Image.clearDiskCache = RealImage.clearDiskCache;

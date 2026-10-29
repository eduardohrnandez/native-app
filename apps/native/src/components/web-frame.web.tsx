import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";

import { fileSystemReady } from "@/web/file-system";

// The app fills the whole window; the tab bar becomes a sidebar on wide screens.
export function WebFrame({ children }: { children: ReactNode }) {
    const [filesLoaded, setFilesLoaded] = useState(false);

    useEffect(() => {
        fileSystemReady.catch(() => undefined).then(() => setFilesLoaded(true));
    }, []);

    useEffect(() => {
        // Unstyled text inherits from body, which would stay black on the dark theme.
        document.body.style.color = "var(--foreground)";
        document.body.style.backgroundColor = "var(--grouped-background)";
        // ui-rounded exists only in Safari; elsewhere the browser would fall back to a serif face.
        const sheet = document.createElement("style");
        sheet.textContent =
            '[style*="ui-rounded"] { font-family: system-ui, "Segoe UI", sans-serif !important; }' +
            // react-native-web paints an enabled switch thumb Material teal, clashing with the accent track.
            ' div[style*="rgb(0, 150, 136)"] { background-color: #ffffff !important; }' +
            // Scrollbars take the theme instead of the browser's bright default.
            " * { scrollbar-color: rgba(128, 128, 128, 0.45) transparent; scrollbar-width: thin; }";
        document.head.append(sheet);
        return () => sheet.remove();
    }, []);

    return (
        <View style={{ backgroundColor: "var(--grouped-background)", flex: 1 }}>{filesLoaded ? children : null}</View>
    );
}

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";

const PHONE_MAX_WIDTH = 520;
const DESKTOP_BREAKPOINT = 900;
const DESKTOP_MAX_WIDTH = 1200;

// A phone-width window fills the screen; a desktop window gets a wider centered canvas with the tab sidebar.
export function WebFrame({ children }: { children: ReactNode }) {
    const { width } = useWindowDimensions();
    const maxWidth = width >= DESKTOP_BREAKPOINT ? DESKTOP_MAX_WIDTH : PHONE_MAX_WIDTH;

    useEffect(() => {
        // Unstyled text inherits from body, which would stay black on the dark theme.
        document.body.style.color = "var(--foreground)";
        document.body.style.backgroundColor = "var(--grouped-background)";
        // ui-rounded exists only in Safari; elsewhere the browser would fall back to a serif face.
        const sheet = document.createElement("style");
        sheet.textContent =
            '[style*="ui-rounded"] { font-family: system-ui, "Segoe UI", sans-serif !important; }' +
            // react-native-web paints an enabled switch thumb Material teal, clashing with the accent track.
            ' div[style*="rgb(0, 150, 136)"] { background-color: #ffffff !important; }';
        document.head.append(sheet);
        return () => sheet.remove();
    }, []);

    return (
        <View style={{ alignItems: "center", backgroundColor: "var(--grouped-background)", flex: 1 }}>
            <View
                style={{
                    borderColor: "var(--separator)",
                    borderLeftWidth: maxWidth === DESKTOP_MAX_WIDTH ? 1 : 0,
                    borderRightWidth: maxWidth === DESKTOP_MAX_WIDTH ? 1 : 0,
                    flex: 1,
                    maxWidth,
                    overflow: "hidden",
                    width: "100%",
                }}
            >
                {children}
            </View>
        </View>
    );
}

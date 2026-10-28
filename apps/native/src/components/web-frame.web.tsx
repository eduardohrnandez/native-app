import type { ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";

const PHONE_MAX_WIDTH = 520;
const DESKTOP_BREAKPOINT = 900;
const DESKTOP_MAX_WIDTH = 1200;

// A phone-width window fills the screen; a desktop window gets a wider centered canvas with the tab sidebar.
export function WebFrame({ children }: { children: ReactNode }) {
    const { width } = useWindowDimensions();
    const maxWidth = width >= DESKTOP_BREAKPOINT ? DESKTOP_MAX_WIDTH : PHONE_MAX_WIDTH;
    return (
        <View style={{ alignItems: "center", backgroundColor: "#e9e6de", flex: 1 }}>
            <View style={{ flex: 1, maxWidth, overflow: "hidden", width: "100%" }}>{children}</View>
        </View>
    );
}

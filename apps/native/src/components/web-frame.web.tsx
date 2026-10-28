import type { ReactNode } from "react";
import { View } from "react-native";

const MAX_APP_WIDTH = 520;

// The app is designed for a phone column; on a desktop window it stays that width, centered.
export function WebFrame({ children }: { children: ReactNode }) {
    return (
        <View style={{ alignItems: "center", backgroundColor: "#e9e6de", flex: 1 }}>
            <View style={{ flex: 1, maxWidth: MAX_APP_WIDTH, overflow: "hidden", width: "100%" }}>{children}</View>
        </View>
    );
}

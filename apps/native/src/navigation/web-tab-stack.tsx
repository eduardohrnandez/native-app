import { Stack } from "expo-router";
import type { ReactNode } from "react";

import { TabPauseProvider } from "@/navigation/tab-pause-provider";
import { useColors } from "@/theme/use-colors";
import { CONTENT_STYLE, HEADER_INSETS } from "@/web/layout";

// The native stacks draw a transparent large-title header that iOS insets content under; a browser needs a solid one.
export function WebTabStack({ children, title }: { children?: ReactNode; title: string }) {
    const { background } = useColors();
    return (
        <TabPauseProvider>
            <Stack
                screenOptions={{
                    contentStyle: CONTENT_STYLE,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: background },
                    ...HEADER_INSETS,
                    headerTitleAlign: "left",
                }}
            >
                <Stack.Screen name="index" options={{ title }} />
                {children}
            </Stack>
        </TabPauseProvider>
    );
}

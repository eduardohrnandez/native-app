import { Stack } from "expo-router";
import type { ReactNode } from "react";

import { TabPauseProvider } from "@/navigation/tab-pause-provider";
import { useColors } from "@/theme/use-colors";

// The native stacks draw a transparent large-title header that iOS insets content under; a browser needs a solid one.
export function WebTabStack({ children, title }: { children?: ReactNode; title: string }) {
    const { background } = useColors();
    return (
        <TabPauseProvider>
            <Stack
                screenOptions={{
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: background },
                    headerTitleAlign: "left",
                }}
            >
                <Stack.Screen name="index" options={{ title }} />
                {children}
            </Stack>
        </TabPauseProvider>
    );
}

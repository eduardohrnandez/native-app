import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import type { AccessibilityValue } from "react-native";

import { cn } from "./tw";

export function GlassButton({
    onPress,
    accessibilityLabel,
    accessibilityValue,
    className,
    children,
}: {
    accessibilityValue?: AccessibilityValue;
    onPress: () => void;
    accessibilityLabel: string;
    className: string;
    children: ReactNode;
}) {
    return (
        <Pressable
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityValue={accessibilityValue}
            className="active:opacity-70"
            onPress={onPress}
        >
            <GlassSurface className={className}>{children}</GlassSurface>
        </Pressable>
    );
}

// A browser paints positioned elements above in-flow ones, so the background would cover the icon without the wrapper.
export function GlassSurface({ className, children }: { className: string; children: ReactNode }) {
    return (
        <View className={cn("flex-row items-center justify-center overflow-hidden", className)}>
            <View className="bg-surface absolute inset-0" />
            <View className="flex-row items-center justify-center gap-1.5" style={{ position: "relative" }}>
                {children}
            </View>
        </View>
    );
}

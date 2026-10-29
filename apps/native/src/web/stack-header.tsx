import { useMemo } from "react";
import type { ReactNode } from "react";

// Resolved by metro.config.cjs to expo-router's own module, which the package's export map does not expose.
import { useCompositionOption } from "expo-router-internal/fork/native-stack/composition-options";
import { useColors } from "../theme/use-colors";

interface HeaderProps {
    asChild?: boolean;
    blurEffect?: unknown;
    children?: ReactNode;
    hidden?: boolean;
    largeStyle?: unknown;
    style?: unknown;
    transparent?: boolean;
}

// A browser has nothing to inset content under a transparent header, so every header here is a solid bar.
export function StackHeaderComponent({ asChild, children, hidden }: HeaderProps) {
    const { background, foreground } = useColors();
    const options = useMemo(() => {
        if (hidden) {
            return { headerShown: false };
        }
        if (asChild) {
            return { header: () => children };
        }
        return {
            headerShadowVisible: false,
            headerShown: true,
            headerStyle: { backgroundColor: background },
            headerTintColor: foreground,
            headerTransparent: false,
        };
    }, [asChild, background, children, foreground, hidden]);
    useCompositionOption(options);
    return null;
}

export function appendStackHeaderPropsToOptions(options: object) {
    return { ...options, headerShown: true, headerTransparent: false };
}

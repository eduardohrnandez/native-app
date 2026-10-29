export * from "react-native-web/dist/index";

// react-native-web has no iOS system colors, so these resolve to neutral CSS values.
export function PlatformColor(...names: string[]): string {
    const [name = ""] = names;
    if (name.startsWith("systemGray") || name.endsWith("Fill")) {
        return "rgba(128, 128, 128, 0.35)";
    }
    // The theme's own variables, so text follows light and dark like the rest of the app.
    return name.startsWith("secondary") || name.startsWith("tertiary") ? "var(--muted)" : "var(--foreground)";
}

export function DynamicColorIOS(options: { dark?: string; light?: string }): string | undefined {
    return options.light;
}

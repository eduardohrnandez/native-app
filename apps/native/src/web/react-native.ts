export * from "react-native-web/dist/index";

// react-native-web has no iOS system colors, so these resolve to neutral CSS values.
export function PlatformColor(...names: string[]): string {
    const [name = ""] = names;
    return name.startsWith("systemGray") || name.endsWith("Fill") ? "rgba(128, 128, 128, 0.35)" : "currentcolor";
}

export function DynamicColorIOS(options: { dark?: string; light?: string }): string | undefined {
    return options.light;
}

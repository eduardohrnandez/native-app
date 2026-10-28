import { Text } from "react-native";

const GLYPHS: Record<string, string> = { "delete.left": "⌫", photo: "▣" };

export function SymbolView({ name, size = 20, tintColor }: { name: string; size?: number; tintColor?: unknown; [key: string]: unknown }) {
    return (
        <Text style={{ color: typeof tintColor === "string" ? tintColor : undefined, fontSize: size }}>
            {GLYPHS[name] ?? "•"}
        </Text>
    );
}

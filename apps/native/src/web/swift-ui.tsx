import { createContext, use, useState } from "react";
import type { ReactNode } from "react";
import {
    Image as RNImage,
    Pressable,
    ScrollView as RNScrollView,
    Switch as RNSwitch,
    Text as RNText,
    TextInput,
    View,
} from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { useColors } from "@/theme/use-colors";

import type { WebModifier } from "./swift-modifiers";
import { SymbolView } from "./symbols";

type Modifiers = readonly (WebModifier | false | null | undefined)[] | undefined;

interface Resolved {
    label?: string;
    lines?: number;
    onPress?: () => void;
    style: ViewStyle & TextStyle;
    tag?: unknown;
}

const WEIGHTS: Record<string, TextStyle["fontWeight"]> = {
    black: "900",
    bold: "700",
    heavy: "800",
    light: "300",
    medium: "500",
    regular: "400",
    semibold: "600",
    thin: "200",
    ultraLight: "100",
};
const TEXT_STYLE_SIZES: Record<string, number> = {
    body: 17,
    callout: 16,
    caption: 12,
    caption2: 11,
    footnote: 13,
    headline: 17,
    largeTitle: 34,
    subheadline: 15,
    title: 28,
    title2: 22,
    title3: 20,
};

function colorOf(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object" && value !== null && "color" in value) {
        return colorOf((value as { color: unknown }).color);
    }
    return undefined;
}

function sizeOf(value: unknown): number | string | undefined {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : "100%";
    }
    return undefined;
}

function resolve(modifiers: Modifiers): Resolved {
    const out: Resolved = { style: {} };
    for (const mod of modifiers ?? []) {
        if (!mod) {
            continue;
        }
        const args = mod.args as Record<string, unknown> | string | number | undefined;
        const record = typeof args === "object" && args !== null ? args : {};
        switch (mod.name) {
            case "font": {
                const size = (record.size as number | undefined) ?? TEXT_STYLE_SIZES[String(record.textStyle)];
                out.style.fontSize = size;
                out.style.fontWeight = WEIGHTS[String(record.weight)] ?? out.style.fontWeight;
                if (record.design === "monospaced") {
                    out.style.fontFamily = "ui-monospace, Menlo, monospace";
                }
                break;
            }
            case "foregroundStyle": {
                out.style.color = colorOf(args);
                break;
            }
            case "frame": {
                out.style.width = sizeOf(record.width) ?? sizeOf(record.maxWidth);
                out.style.height = sizeOf(record.height) ?? sizeOf(record.maxHeight);
                if (record.alignment === "leading") {
                    out.style.alignItems = "flex-start";
                }
                break;
            }
            case "padding": {
                if (typeof args === "number") {
                    out.style.padding = args;
                    break;
                }
                const all = record.all as number | undefined;
                out.style.paddingTop =
                    (record.top as number | undefined) ?? (record.vertical as number | undefined) ?? all;
                out.style.paddingBottom =
                    (record.bottom as number | undefined) ?? (record.vertical as number | undefined) ?? all;
                out.style.paddingLeft =
                    (record.leading as number | undefined) ?? (record.horizontal as number | undefined) ?? all;
                out.style.paddingRight =
                    (record.trailing as number | undefined) ?? (record.horizontal as number | undefined) ?? all;
                break;
            }
            case "background": {
                out.style.backgroundColor = colorOf(args);
                break;
            }
            case "opacity": {
                out.style.opacity = args as number;
                break;
            }
            case "lineLimit": {
                out.lines = args as number;
                break;
            }
            case "multilineTextAlignment": {
                out.style.textAlign = args === "trailing" ? "right" : args === "center" ? "center" : "left";
                break;
            }
            case "onTapGesture": {
                out.onPress = args as () => void;
                break;
            }
            case "accessibilityLabel": {
                out.label = String(args);
                break;
            }
            case "tag": {
                out.tag = args;
                break;
            }
            case "monospacedDigit": {
                out.style.fontVariant = ["tabular-nums"];
                break;
            }
            case "textCase": {
                out.style.textTransform = args === "uppercase" ? "uppercase" : undefined;
                break;
            }
            default: {
                break;
            }
        }
    }
    return out;
}

function boxStyle(resolved: Resolved, extra: ViewStyle): StyleProp<ViewStyle> {
    return [extra, resolved.style];
}

interface StackProps {
    alignment?: string;
    children?: ReactNode;
    modifiers?: Modifiers;
    spacing?: number;
}

function crossAxis(alignment: string | undefined): ViewStyle["alignItems"] {
    if (alignment === "leading" || alignment === "top") {
        return "flex-start";
    }
    if (alignment === "trailing" || alignment === "bottom") {
        return "flex-end";
    }
    return alignment === undefined ? undefined : "center";
}

export function VStack({ alignment, children, modifiers, spacing = 8 }: StackProps) {
    const resolved = resolve(modifiers);
    return (
        <View style={boxStyle(resolved, { alignItems: crossAxis(alignment), flexDirection: "column", gap: spacing })}>
            {children}
        </View>
    );
}

export function HStack({ alignment, children, modifiers, spacing = 8 }: StackProps) {
    const resolved = resolve(modifiers);
    const style = boxStyle(resolved, {
        alignItems: crossAxis(alignment) ?? "center",
        flexDirection: "row",
        gap: spacing,
    });
    // A disabled Pressable would also disable any field inside the row.
    if (resolved.onPress === undefined) {
        return <View style={style}>{children}</View>;
    }
    return (
        <Pressable onPress={resolved.onPress} style={style}>
            {children}
        </Pressable>
    );
}

export function ZStack({ children, modifiers }: StackProps) {
    return <View style={boxStyle(resolve(modifiers), { position: "relative" })}>{children}</View>;
}

export function Spacer({ modifiers }: { modifiers?: Modifiers }) {
    const resolved = resolve(modifiers);
    const fixed = resolved.style.height !== undefined || resolved.style.width !== undefined;
    return <View style={boxStyle(resolved, fixed ? {} : { flexGrow: 1 })} />;
}

export function Host({
    children,
    matchContents,
    style,
}: {
    children?: ReactNode;
    matchContents?: boolean;
    style?: StyleProp<ViewStyle>;
    [key: string]: unknown;
}) {
    return <View style={[matchContents ? { alignSelf: "flex-start" } : null, style]}>{children}</View>;
}

export function RNHostView({ children }: { children?: ReactNode; [key: string]: unknown }) {
    return <>{children}</>;
}

export function Text({ children, modifiers }: { children?: ReactNode; modifiers?: Modifiers }) {
    const resolved = resolve(modifiers);
    const picker = use(PickerContext);
    if (picker !== null && resolved.tag !== undefined) {
        return <PickerOption modifiers={modifiers}>{children}</PickerOption>;
    }
    return (
        <RNText numberOfLines={resolved.lines} style={[{ color: "var(--foreground)" }, resolved.style]}>
            {children}
        </RNText>
    );
}

export function Button({
    children,
    label,
    modifiers,
    onPress,
}: {
    children?: ReactNode;
    label?: string;
    modifiers?: Modifiers;
    onPress?: () => void;
    [key: string]: unknown;
}) {
    const resolved = resolve(modifiers);
    return (
        <Pressable accessibilityRole="button" onPress={onPress ?? resolved.onPress} style={boxStyle(resolved, {})}>
            {children ?? <RNText>{label}</RNText>}
        </Pressable>
    );
}

export function Toggle({
    isOn,
    onIsOnChange,
    value,
    onCheckedChange,
    label,
}: {
    isOn?: boolean;
    label?: string;
    onCheckedChange?: (next: boolean) => void;
    onIsOnChange?: (next: boolean) => void;
    value?: boolean;
    [key: string]: unknown;
}) {
    const { tint } = useColors();
    return (
        <RNSwitch
            accessibilityLabel={label}
            onValueChange={(next) => (onIsOnChange ?? onCheckedChange)?.(next)}
            thumbColor="#ffffff"
            activeThumbColor="#ffffff"
            activeTrackColor={tint}
            trackColor={{ false: "rgba(128, 128, 128, 0.4)", true: tint }}
            value={isOn ?? value ?? false}
        />
    );
}
export const Switch = Toggle;

export function TextField({
    defaultValue,
    modifiers,
    onChangeText,
    onTextChange,
    placeholder,
    text,
}: {
    defaultValue?: string;
    modifiers?: Modifiers;
    onChangeText?: (value: string) => void;
    onTextChange?: (value: string) => void;
    placeholder?: string;
    text?: { value?: string } | string;
    [key: string]: unknown;
}) {
    const resolved = resolve(modifiers);
    const initial = (typeof text === "string" ? text : text?.value) ?? defaultValue ?? "";
    const [value, setValue] = useState(initial);
    // The native state object is not reactive in a browser, so the field keeps its own copy and mirrors it back.
    return (
        <TextInput
            onChangeText={(next) => {
                setValue(next);
                if (typeof text === "object" && text !== null) {
                    text.value = next;
                }
                (onTextChange ?? onChangeText)?.(next);
            }}
            placeholder={placeholder}
            placeholderTextColor="rgba(128, 128, 128, 0.7)"
            style={[{ color: "var(--foreground)" }, resolved.style]}
            value={value}
        />
    );
}

interface PickerProps {
    children?: ReactNode;
    modifiers?: Modifiers;
    onSelectionChange?: (value: string) => void;
    selection?: string;
    [key: string]: unknown;
}

const PickerContext = createContext<{ onSelect?: (value: string) => void; selected?: string } | null>(null);

export function Picker({ children, onSelectionChange, selection }: PickerProps) {
    return (
        <PickerContext value={{ onSelect: onSelectionChange, selected: selection }}>
            <View
                style={{
                    backgroundColor: "rgba(128, 128, 128, 0.18)",
                    borderRadius: 10,
                    flexDirection: "row",
                    gap: 2,
                    padding: 2,
                }}
            >
                {children}
            </View>
        </PickerContext>
    );
}

// A picker option is a Text with a `tag`; on the web it renders as a selectable chip.
export function PickerOption({ children, modifiers }: { children?: ReactNode; modifiers?: Modifiers }) {
    const context = use(PickerContext);
    const resolved = resolve(modifiers);
    const value = resolved.tag === undefined ? undefined : String(resolved.tag);
    const selected = value !== undefined && value === context?.selected;
    return (
        <Pressable
            onPress={() => value !== undefined && context?.onSelect?.(value)}
            style={{
                backgroundColor: selected ? "var(--surface-secondary)" : "transparent",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
            }}
        >
            <RNText style={{ color: "var(--foreground)", fontWeight: selected ? "700" : "400" }}>{children}</RNText>
        </Pressable>
    );
}

export function ScrollView({ children, modifiers }: { children?: ReactNode; modifiers?: Modifiers }) {
    return <RNScrollView style={resolve(modifiers).style}>{children}</RNScrollView>;
}

// SwiftUI insets grouped rows from the screen edge; a plain scroller needs that spelled out.
const LIST_INSET = { paddingBottom: 24, paddingHorizontal: 20, paddingTop: 8 } as const;

export function List({ children, modifiers }: { children?: ReactNode; modifiers?: Modifiers }) {
    return (
        <RNScrollView contentContainerStyle={LIST_INSET} style={resolve(modifiers).style}>
            {children}
        </RNScrollView>
    );
}
List.ForEach = function ForEach<Item>({
    children,
    data,
    keyExtractor,
}: {
    children: (item: Item, index: number) => ReactNode;
    data: readonly Item[];
    keyExtractor?: (item: Item, index: number) => string;
}) {
    return (
        <>
            {data.map((item, index) => (
                <View key={keyExtractor?.(item, index) ?? index}>{children(item, index)}</View>
            ))}
        </>
    );
};

export function Section({
    children,
    footer,
    header,
    modifiers,
}: {
    children?: ReactNode;
    footer?: ReactNode;
    header?: ReactNode;
    modifiers?: Modifiers;
}) {
    return (
        <View style={resolve(modifiers).style}>
            {header}
            {children}
            {footer}
        </View>
    );
}

// Swipe actions have no pointer gesture on the web, so the row renders and its trailing actions stay out of sight.
export function SwipeActions({ children }: { children?: ReactNode; [key: string]: unknown }) {
    return <>{children}</>;
}
SwipeActions.Actions = function SwipeActionsActions(_props: { children?: ReactNode; edge?: string }) {
    return null;
};

export function Divider() {
    return <View style={{ backgroundColor: "rgba(128,128,128,0.3)", height: 1 }} />;
}

export function Rectangle({ modifiers }: { modifiers?: Modifiers }) {
    const resolved = resolve(modifiers);
    return <View style={{ backgroundColor: resolved.style.color, ...resolved.style }} />;
}

export function Circle({ modifiers }: { modifiers?: Modifiers }) {
    const resolved = resolve(modifiers);
    const side = (resolved.style.width as number | undefined) ?? (resolved.style.height as number | undefined) ?? 12;
    return <View style={{ backgroundColor: resolved.style.color, borderRadius: side, height: side, width: side }} />;
}

export function Image({
    color,
    modifiers,
    source,
    style,
    systemName,
}: {
    color?: string;
    modifiers?: Modifiers;
    source?: { uri: string };
    style?: StyleProp<ViewStyle>;
    systemName?: string;
    [key: string]: unknown;
}) {
    if (source !== undefined) {
        return <RNImage source={source} style={style as object} />;
    }
    const resolved = resolve(modifiers);
    return <SymbolView name={systemName ?? ""} size={resolved.style.fontSize ?? 17} tintColor={color} />;
}

export function ProgressView({ value }: { value?: number; [key: string]: unknown }) {
    const [width] = useState(0);
    return (
        <View style={{ backgroundColor: "rgba(128,128,128,0.25)", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <View
                style={{
                    backgroundColor: "#888",
                    height: 6,
                    width: `${Math.round(Math.min(1, Math.max(0, value ?? width)) * 100)}%`,
                }}
            />
        </View>
    );
}

export function DatePicker({
    onDateChange,
    selection,
}: {
    onDateChange?: (date: Date) => void;
    selection?: Date;
    [key: string]: unknown;
}) {
    const value = selection
        ? new Date(selection.getTime() - selection.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
        : "";
    return (
        <input
            onChange={(event) => event.target.value && onDateChange?.(new Date(event.target.value))}
            type="datetime-local"
            value={value}
        />
    );
}

export function ColorPicker() {
    return null;
}

export function Gauge() {
    return null;
}

export function useNativeState<Value>(initial: Value): { value: Value } {
    const [state] = useState({ value: initial });
    return state;
}

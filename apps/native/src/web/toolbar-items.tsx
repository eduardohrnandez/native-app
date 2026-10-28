import { Stack } from "expo-router";
import { Children, Fragment, isValidElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

// Stack.Toolbar items are native header buttons; a browser header gets plain buttons and a dropdown for menus.
const GLYPHS: Record<string, string> = {
    add: "+",
    close: "✕",
    delete: "🗑",
    done: "✓",
    filter: "⚲",
    more: "⋯",
    period: "▾",
    reorder: "↕",
    search: "⌕",
};
const FALLBACK_GLYPH = "•";
const MENU_WIDTH = 240;

type Props = Record<string, unknown> & { children?: ReactNode };

function flatten(children: ReactNode): ReactElement<Props>[] {
    const out: ReactElement<Props>[] = [];
    for (const child of Children.toArray(children)) {
        if (!isValidElement<Props>(child)) {
            continue;
        }
        if (child.type === Fragment) {
            out.push(...flatten(child.props.children));
        } else {
            out.push(child);
        }
    }
    return out;
}

function label(children: ReactNode): string {
    const texts: string[] = [];
    for (const child of Children.toArray(children)) {
        if (typeof child === "string" || typeof child === "number") {
            texts.push(String(child));
        } else if (isValidElement<Props>(child) && child.type === Stack.Toolbar.Label) {
            texts.push(label(child.props.children));
        }
    }
    return texts.join("");
}

function glyph(children: ReactNode, icon: unknown): string | null {
    const iconElement = flatten(children).find((child) => child.type === Stack.Toolbar.Icon);
    const xcasset = iconElement?.props.xcasset;
    if (typeof xcasset === "string") {
        return GLYPHS[xcasset.replace("nano.", "")] ?? FALLBACK_GLYPH;
    }
    return iconElement !== undefined || typeof icon === "string" ? FALLBACK_GLYPH : null;
}

function ToolbarButton({ element }: { element: ReactElement<Props> }) {
    const { accessibilityLabel, children, disabled, icon, onPress } = element.props;
    const text = label(children);
    const mark = glyph(children, icon);
    return (
        <Pressable
            accessibilityLabel={typeof accessibilityLabel === "string" ? accessibilityLabel : text}
            accessibilityRole="button"
            disabled={disabled === true}
            onPress={typeof onPress === "function" ? (onPress as () => void) : undefined}
            style={{ opacity: disabled === true ? 0.4 : 1, paddingHorizontal: 10, paddingVertical: 6 }}
        >
            <Text style={{ fontSize: mark !== null && text === "" ? 20 : 15 }}>{text === "" ? mark : text}</Text>
        </Pressable>
    );
}

function ToolbarMenu({ element }: { element: ReactElement<Props> }) {
    const [open, setOpen] = useState(false);
    const { accessibilityLabel, children, title } = element.props;
    const actions = flatten(children).filter((child) => child.type === Stack.Toolbar.MenuAction);
    const mark = glyph(children, undefined) ?? "⋯";
    return (
        <View style={{ position: "relative" }}>
            <Pressable
                accessibilityLabel={typeof accessibilityLabel === "string" ? accessibilityLabel : String(title ?? "")}
                accessibilityRole="button"
                onPress={() => setOpen((value) => !value)}
                style={{ paddingHorizontal: 10, paddingVertical: 6 }}
            >
                <Text style={{ fontSize: 20 }}>{mark}</Text>
            </Pressable>
            {open ? (
                <View
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                        position: "absolute",
                        right: 0,
                        top: 36,
                        width: MENU_WIDTH,
                        zIndex: 100,
                    }}
                >
                    {actions.map((action, index) => (
                        <Pressable
                            key={action.key ?? index}
                            onPress={() => {
                                setOpen(false);
                                if (typeof action.props.onPress === "function") {
                                    (action.props.onPress as () => void)();
                                }
                            }}
                            style={{ padding: 12 }}
                        >
                            <Text style={{ fontSize: 15 }}>{label(action.props.children)}</Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

function ToolbarItems({ children }: { children: ReactNode }) {
    return (
        <View style={{ alignItems: "center", flexDirection: "row", paddingHorizontal: 6 }}>
            {flatten(children).map((child, index) => {
                const key = child.key ?? index;
                if (child.type === Stack.Toolbar.Button) {
                    return <ToolbarButton element={child} key={key} />;
                }
                if (child.type === Stack.Toolbar.Menu) {
                    return <ToolbarMenu element={child} key={key} />;
                }
                if (child.type === Stack.Toolbar.View) {
                    return <View key={key}>{child.props.children}</View>;
                }
                return null;
            })}
        </View>
    );
}

export function processHeaderItemsForPlatform(children: ReactNode, placement: string) {
    if (placement === "left") {
        return { headerLeft: () => <ToolbarItems>{children}</ToolbarItems>, headerShown: true };
    }
    if (placement === "right") {
        return { headerRight: () => <ToolbarItems>{children}</ToolbarItems>, headerShown: true };
    }
    return null;
}

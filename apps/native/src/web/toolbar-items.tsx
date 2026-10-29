import ArrowDataTransferVerticalIcon from "@app/icons/arrow-data-transfer-vertical-icon";
import ArrowDown01Icon from "@app/icons/arrow-down01-icon";
import Cancel01Icon from "@app/icons/cancel01-icon";
import Delete02Icon from "@app/icons/delete02-icon";
import MoreHorizontalCircle01Icon from "@app/icons/more-horizontal-circle01-icon";
import PlusSignIcon from "@app/icons/plus-sign-icon";
import Search01Icon from "@app/icons/search01-icon";
import Tick02Icon from "@app/icons/tick02-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Stack } from "expo-router";
import { Children, Fragment, isValidElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

// Stack.Toolbar items are native header buttons; a browser header gets plain buttons and a dropdown for menus.
const ICONS = {
    add: PlusSignIcon,
    close: Cancel01Icon,
    delete: Delete02Icon,
    done: Tick02Icon,
    filter: MoreHorizontalCircle01Icon,
    more: MoreHorizontalCircle01Icon,
    period: ArrowDown01Icon,
    reorder: ArrowDataTransferVerticalIcon,
    search: Search01Icon,
} as const;
type IconName = keyof typeof ICONS;
const FALLBACK_ICON: IconName = "more";
const ICON_SIZE = 22;
const ICON_COLOR = "var(--foreground)";

function isIconName(name: string): name is IconName {
    return name in ICONS;
}
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

function iconName(children: ReactNode, icon: unknown): IconName | null {
    const iconElement = flatten(children).find((child) => child.type === Stack.Toolbar.Icon);
    const xcasset = iconElement?.props.xcasset;
    if (typeof xcasset === "string") {
        const name = xcasset.replace("nano.", "");
        return isIconName(name) ? name : FALLBACK_ICON;
    }
    return iconElement !== undefined || typeof icon === "string" ? FALLBACK_ICON : null;
}

function ToolbarButton({ element }: { element: ReactElement<Props> }) {
    const { accessibilityLabel, children, disabled, icon, onPress } = element.props;
    const text = label(children);
    const mark = iconName(children, icon);
    return (
        <Pressable
            accessibilityLabel={typeof accessibilityLabel === "string" ? accessibilityLabel : text}
            accessibilityRole="button"
            disabled={disabled === true}
            onPress={typeof onPress === "function" ? (onPress as () => void) : undefined}
            style={{ opacity: disabled === true ? 0.4 : 1, paddingHorizontal: 10, paddingVertical: 6 }}
        >
            {mark !== null && text === "" ? (
                <HugeiconsIcon color={ICON_COLOR} icon={ICONS[mark]} size={ICON_SIZE} />
            ) : (
                <Text style={{ color: "var(--tint)", fontSize: 15 }}>{text}</Text>
            )}
        </Pressable>
    );
}

function ToolbarMenu({ element }: { element: ReactElement<Props> }) {
    const [open, setOpen] = useState(false);
    const { accessibilityLabel, children, title } = element.props;
    const actions = flatten(children).filter((child) => child.type === Stack.Toolbar.MenuAction);
    const mark = iconName(children, undefined) ?? FALLBACK_ICON;
    return (
        <View style={{ position: "relative" }}>
            <Pressable
                accessibilityLabel={typeof accessibilityLabel === "string" ? accessibilityLabel : String(title ?? "")}
                accessibilityRole="button"
                onPress={() => setOpen((value) => !value)}
                style={{ paddingHorizontal: 10, paddingVertical: 6 }}
            >
                <HugeiconsIcon color={ICON_COLOR} icon={ICONS[mark]} size={ICON_SIZE} />
            </Pressable>
            {open ? (
                <View
                    style={{
                        backgroundColor: "var(--surface-secondary)",
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
                            <Text style={{ color: "var(--foreground)", fontSize: 15 }}>{label(action.props.children)}</Text>
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

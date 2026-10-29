import { useImperativeHandle, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

interface MenuAction {
    attributes?: { destructive?: boolean; disabled?: boolean; hidden?: boolean };
    id?: string;
    state?: "off" | "on";
    subactions?: MenuAction[];
    title: string;
}

interface MenuViewProps {
    actions: MenuAction[];
    children?: ReactNode;
    onCloseMenu?: () => void;
    onOpenMenu?: () => void;
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    ref?: Ref<{ show: () => void }>;
    shouldOpenOnLongPress?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    title?: string;
}

interface Anchor {
    left: number;
    top: number;
}

const MENU_WIDTH = 240;
const EDGE_GAP = 8;

function flatten(actions: MenuAction[]): MenuAction[] {
    return actions.flatMap((action) => (action.subactions ? flatten(action.subactions) : [action]));
}

// The native menu is a popup anchored to its trigger; a browser gets a dropdown drawn above the page.
export function MenuView({
    actions,
    children,
    onCloseMenu,
    onOpenMenu,
    onPressAction,
    ref,
    shouldOpenOnLongPress,
    style,
    testID,
    title,
}: MenuViewProps) {
    const trigger = useRef<View>(null);
    const [anchor, setAnchor] = useState<Anchor | null>(null);

    const open = () => {
        // SAFETY: react-native-web hands out the DOM element as the View ref.
        const element = trigger.current as unknown as HTMLElement | null;
        const box = element?.getBoundingClientRect();
        const left = Math.min(box?.left ?? EDGE_GAP, window.innerWidth - MENU_WIDTH - EDGE_GAP);
        setAnchor({ left: Math.max(EDGE_GAP, left), top: (box?.bottom ?? 0) + 6 });
        onOpenMenu?.();
    };
    const close = () => {
        setAnchor(null);
        onCloseMenu?.();
    };
    useImperativeHandle(ref, () => ({ show: open }));

    const items = flatten(actions).filter((action) => action.attributes?.hidden !== true);

    return (
        <>
            <Pressable
                onLongPress={shouldOpenOnLongPress === true ? open : undefined}
                onPress={shouldOpenOnLongPress === true ? undefined : open}
                ref={trigger}
                style={style}
                testID={testID}
            >
                {children}
            </Pressable>
            {anchor !== null
                ? createPortal(
                      <div onClick={close} role="presentation" style={{ inset: 0, position: "fixed", zIndex: 1000 }}>
                          <div
                              role="menu"
                              style={{
                                  background: "var(--surface-secondary)",
                                  border: "1px solid var(--separator)",
                                  borderRadius: 12,
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                                  left: anchor.left,
                                  maxHeight: "60vh",
                                  overflowY: "auto",
                                  position: "absolute",
                                  top: anchor.top,
                                  width: MENU_WIDTH,
                              }}
                          >
                              {title ? (
                                  <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
                                      <Text style={{ color: "var(--muted)", fontSize: 12 }}>{title}</Text>
                                  </View>
                              ) : null}
                              {items.map((action, index) => (
                                  <Pressable
                                      accessibilityRole="menuitem"
                                      disabled={action.attributes?.disabled === true}
                                      key={action.id ?? `${action.title}-${index}`}
                                      onPress={() => {
                                          close();
                                          if (action.id !== undefined) {
                                              onPressAction?.({ nativeEvent: { event: action.id } });
                                          }
                                      }}
                                      style={{
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          opacity: action.attributes?.disabled === true ? 0.4 : 1,
                                          padding: 12,
                                      }}
                                  >
                                      <Text
                                          style={{
                                              color:
                                                  action.attributes?.destructive === true
                                                      ? "var(--danger)"
                                                      : "var(--foreground)",
                                              fontSize: 15,
                                          }}
                                      >
                                          {action.title}
                                      </Text>
                                      {action.state === "on" ? (
                                          <Text style={{ color: "var(--tint)", fontSize: 15 }}>✓</Text>
                                      ) : null}
                                  </Pressable>
                              ))}
                          </div>
                      </div>,
                      document.body
                  )
                : null}
        </>
    );
}

import Analytics01Icon from "@app/icons/analytics01-icon";
import MoreHorizontalCircle01Icon from "@app/icons/more-horizontal-circle01-icon";
import Target01Icon from "@app/icons/target01-icon";
import Wallet01Icon from "@app/icons/wallet01-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement as IconData } from "@hugeicons/react-native";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import type { ColorValue } from "react-native";

import { useTranslation } from "@/i18n/context";
import { useColors } from "@/theme/use-colors";

const SIDEBAR_MIN_WIDTH = 900;
const ACTIVE_BACKGROUND = "rgba(128, 128, 128, 0.16)";
const TAB_ICON_SIZE = 22;

const TABS = [
    { icon: Wallet01Icon, name: "(transactions)", labelKey: "nav.tab.log" },
    { icon: Analytics01Icon, name: "insights", labelKey: "nav.tab.insights" },
    { icon: Target01Icon, name: "budgets", labelKey: "nav.tab.budgets" },
    { icon: MoreHorizontalCircle01Icon, name: "settings", labelKey: "nav.tab.settings" },
] as const;

function tabIcon(icon: IconData) {
    // oxlint-disable-next-line react/no-unstable-nested-components -- tabBarIcon is a render callback
    return ({ color }: { color: ColorValue }) => <HugeiconsIcon color={color} icon={icon} size={TAB_ICON_SIZE} />;
}

// A phone-width window keeps the tab bar at the bottom; a wide one moves it to a sidebar.
export default function TabLayout() {
    const { tint, background } = useColors();
    const t = useTranslation();
    const { width } = useWindowDimensions();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: background },
                tabBarActiveBackgroundColor: ACTIVE_BACKGROUND,
                tabBarActiveTintColor: tint,
                tabBarStyle: {
                    backgroundColor: background,
                    borderColor: "var(--separator)",
                    height: width >= SIDEBAR_MIN_WIDTH ? undefined : 64,
                },
                tabBarLabelStyle: { paddingBottom: 4 },
                tabBarPosition: width >= SIDEBAR_MIN_WIDTH ? "left" : "bottom",
            }}
        >
            {TABS.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        tabBarIcon: tabIcon(tab.icon),
                        title: t(tab.labelKey),
                    }}
                />
            ))}
        </Tabs>
    );
}

import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";

import { useTranslation } from "@/i18n/context";
import { useColors } from "@/theme/use-colors";

const SIDEBAR_MIN_WIDTH = 900;
const ACTIVE_BACKGROUND = "rgba(0, 0, 0, 0.06)";

const TABS = [
    { name: "(transactions)", labelKey: "nav.tab.log" },
    { name: "insights", labelKey: "nav.tab.insights" },
    { name: "budgets", labelKey: "nav.tab.budgets" },
    { name: "settings", labelKey: "nav.tab.settings" },
] as const;

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
                tabBarIcon: () => null,
                tabBarPosition: width >= SIDEBAR_MIN_WIDTH ? "left" : "bottom",
            }}
        >
            {TABS.map((tab) => (
                <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.labelKey) }} />
            ))}
        </Tabs>
    );
}

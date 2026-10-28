import { Stack } from "expo-router";

import { useTranslation } from "@/i18n/context";
import { WebTabStack } from "@/navigation/web-tab-stack";

export default function BudgetsLayout() {
    const t = useTranslation();
    return (
        <WebTabStack title={t("budgets.title")}>
            <Stack.Screen name="overall" options={{ title: "" }} />
            <Stack.Screen name="[id]" options={{ title: "" }} />
            <Stack.Screen name="goals/[id]" options={{ title: "" }} />
        </WebTabStack>
    );
}

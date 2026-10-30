import { useState } from "react";
import { Pressable, View } from "react-native";

import { RESET_FLAG } from "@/db/reset-flag";
import { useTranslation } from "@/i18n/context";

import { Text } from "./text";

// The browser copy is cleared by the next load, before any database worker exists to hold it open.
export function LocalDataReset() {
    const t = useTranslation();
    const [failed, setFailed] = useState(false);

    const reset = () => {
        try {
            sessionStorage.setItem(RESET_FLAG, "1");
            window.location.reload();
        } catch {
            setFailed(true);
        }
    };

    return (
        <View className="items-center gap-3 pt-8">
            <Text className="text-label text-muted text-center">{t("transaction.localData.resetHint")}</Text>
            <Pressable
                accessibilityRole="button"
                className="border-border rounded-xl border px-5 py-2.5 active:opacity-70"
                onPress={reset}
            >
                <Text className="text-body text-foreground">{t("transaction.localData.reset")}</Text>
            </Pressable>
            {failed ? (
                <Text className="text-label text-danger text-center">{t("transaction.localData.resetFailed")}</Text>
            ) : null}
        </View>
    );
}

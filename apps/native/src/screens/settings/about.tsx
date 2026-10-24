import { useRouter } from "expo-router";
import { View } from "react-native";

import { LinkRow, SettingsSection } from "@/components/list/list-row";
import { MonoLabel } from "@/components/mono-label";
import { SettingsScreen } from "@/components/settings/settings-screen";
import { Text } from "@/components/text";
import { useTranslation } from "@/i18n/context";
import { openInAppBrowser } from "@/lib/app-handoff";
import { APP_VERSION } from "@/lib/app-version";

const GPL_LICENSE = "https://www.gnu.org/licenses/gpl-3.0.html";
const LOGO_DEV = "https://logo.dev";

export function About() {
    const t = useTranslation();
    const router = useRouter();
    return (
        <SettingsScreen footer={t("settings.about.version", { version: APP_VERSION })}>
            <View className="pt-6">
                <Text className="text-body text-foreground leading-relaxed">{t("settings.about.intro")}</Text>
            </View>

            <SettingsSection title={t("settings.about.links")}>
                <LinkRow
                    icon="License"
                    onPress={() => openInAppBrowser(GPL_LICENSE)}
                    title={t("settings.about.gplLink")}
                />
                <LinkRow
                    icon="LegalDocument01"
                    onPress={() => router.push("/settings/licenses")}
                    title={t("settings.about.openSourceLicenses")}
                />
                <LinkRow
                    icon="Sparkles"
                    onPress={() => openInAppBrowser(LOGO_DEV)}
                    title={t("settings.about.logoDev")}
                />
            </SettingsSection>

            <View className="gap-2 pt-8">
                <MonoLabel>{t("settings.about.licenceHeading")}</MonoLabel>
                <Text className="text-muted text-subtitle leading-relaxed">{t("settings.about.fork")}</Text>
                <Text className="text-muted text-subtitle leading-relaxed">{t("settings.about.copyright")}</Text>
                <Text className="text-muted text-subtitle leading-relaxed">{t("settings.about.warranty")}</Text>
            </View>
        </SettingsScreen>
    );
}

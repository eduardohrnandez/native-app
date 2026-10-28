import { useTranslation } from "@/i18n/context";
import { WebTabStack } from "@/navigation/web-tab-stack";

export default function SettingsTabLayout() {
    const t = useTranslation();
    return <WebTabStack title={t("settings.screenTitle")} />;
}

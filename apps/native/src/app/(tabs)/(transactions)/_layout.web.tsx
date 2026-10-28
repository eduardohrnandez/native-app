import { useTranslation } from "@/i18n/context";
import { WebTabStack } from "@/navigation/web-tab-stack";

export default function LogLayout() {
    const t = useTranslation();
    return <WebTabStack title={t("log.title")} />;
}

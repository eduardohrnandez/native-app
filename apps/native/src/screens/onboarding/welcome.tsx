import { useRouter } from "expo-router";

import { FintaMark } from "@/components/finta-mark";
import { FirstRun } from "@/components/first-run";
import { flyleafDate } from "@/domain/flyleaf";
import { useLanguage, useTranslation } from "@/i18n/context";

export function OnboardingWelcome() {
    const router = useRouter();
    const t = useTranslation();
    const { language } = useLanguage();

    return (
        <FirstRun
            action={{
                label: t("common.continue"),
                onPress: () => router.push("/onboarding/currency"),
            }}
            body={t("onboarding.cover.line")}
            cover
            eyebrow={t("onboarding.welcome.begun", {
                date: flyleafDate(new Date(), language),
            })}
            object={<FintaMark size={92} />}
            title={t("onboarding.welcome.title")}
        />
    );
}

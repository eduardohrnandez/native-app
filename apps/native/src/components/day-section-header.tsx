import ArrowDown01Icon from "@app/icons/arrow-down01-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";

import { useDisplaySettings } from "@/contexts/display-settings-context";
import { formatDayHeader } from "@/domain/dates";
import type { DaySection } from "@/domain/day-sections";
import { useAccessibilityTextSize } from "@/hooks/use-accessibility-text-size";
import { useLanguage, useTranslation } from "@/i18n/context";
import { useColors } from "@/theme/use-colors";

import { ActionMenu } from "./action-menu";
import { DayTotal } from "./amount-text";
import { MonoLabel } from "./mono-label";
import { cn } from "./tw";

interface DaySectionHeaderProps {
    /** Rows hidden under this day; the header and its total stay. */
    collapsed?: boolean;
    first?: boolean;
    onToggle?: () => void;
    onShare?: () => void;
    section: DaySection<unknown>;
}

export function DaySectionHeader({
    section,
    first = false,
    collapsed = false,
    onShare,
    onToggle,
}: DaySectionHeaderProps) {
    const colors = useColors();
    const { showCents } = useDisplaySettings().state;
    // Consuming the language re-renders this on a change; `formatDayHeader`'s default is invisible to React.
    const { language } = useLanguage();
    const t = useTranslation();
    const largeText = useAccessibilityTextSize();
    const body = (
        <>
            <Pressable
                accessibilityRole={onToggle ? "button" : undefined}
                accessibilityState={onToggle ? { expanded: !collapsed } : undefined}
                className={cn("flex-row items-baseline justify-between gap-2", largeText && "flex-wrap")}
                disabled={!onToggle}
                onPress={onToggle}
            >
                <View className="flex-row items-center gap-1.5">
                    <MonoLabel>{formatDayHeader(section.day, undefined, language)}</MonoLabel>
                    {onToggle ? (
                        <View style={{ transform: [{ rotate: collapsed ? "-90deg" : "0deg" }] }}>
                            <HugeiconsIcon color={colors.muted} icon={ArrowDown01Icon} size={14} />
                        </View>
                    ) : null}
                </View>
                <DayTotal showCents={showCents} totals={section.totals} />
            </Pressable>
            {/* A 1.3 stroke with round caps, not a 1px border. */}
            <View className="bg-border" style={{ borderRadius: 0.65, height: 1.3 }} />
        </>
    );
    const className = first ? "gap-1.25 pt-2.5" : "gap-1.25 pt-7";

    if (!onShare) {
        return <View className={className}>{body}</View>;
    }

    return (
        <ActionMenu
            items={[
                {
                    icon: "square.and.arrow.up",
                    id: "share",
                    label: t("alerts.dayCard.share"),
                    onPress: onShare,
                },
            ]}
            owner={String(section.day.getTime())}
        >
            {/* The menu snapshots this view for its preview, so it carries the group's ground. */}
            <View className={cn("bg-background", className)}>{body}</View>
        </ActionMenu>
    );
}

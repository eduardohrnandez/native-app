import Calendar03SolidIcon from "@app/icons/calendar03-icon";
import DivideSignCircleSolidIcon from "@app/icons/divide-sign-circle-icon";
import NoteEditSolidIcon from "@app/icons/note-edit-icon";
import PercentCircleSolidIcon from "@app/icons/percent-circle-icon";
import PlusSignIcon from "@app/icons/plus-sign-icon";
import RepeatSolidIcon from "@app/icons/repeat-icon";
import SparklesSolidIcon from "@app/icons/sparkles-icon";
import Tag01SolidIcon from "@app/icons/tag01-icon";
import type { IconSvgElement } from "@hugeicons/react-native";

// No platform twin: `fact-chips.tsx` and its Android sibling share it.
export const FACT_GLYPHS = {
    add: { set: PlusSignIcon, unset: PlusSignIcon },
    fee: { set: PercentCircleSolidIcon, unset: PercentCircleSolidIcon },
    icon: { set: SparklesSolidIcon, unset: SparklesSolidIcon },
    installments: { set: Calendar03SolidIcon, unset: Calendar03SolidIcon },
    note: { set: NoteEditSolidIcon, unset: NoteEditSolidIcon },
    repeat: { set: RepeatSolidIcon, unset: RepeatSolidIcon },
    split: { set: DivideSignCircleSolidIcon, unset: DivideSignCircleSolidIcon },
    tags: { set: Tag01SolidIcon, unset: Tag01SolidIcon },
} as const satisfies Record<string, { set: IconSvgElement; unset: IconSvgElement }>;

export type SentenceFactKey = keyof typeof FACT_GLYPHS;

export interface SentenceVerb {
    accessibilityLabel?: string;
    active: boolean;
    disabled?: boolean;
    key: SentenceFactKey;
    /** Once the fact is set this is its value ("monthly", "3 ways"), not the noun that offered it. */
    label: string;
    onPress: () => void;
    onRemove?: () => void;
    removeAccessibilityLabel?: string;
}

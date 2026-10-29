import AlertCircleIcon from "@app/icons/alert-circle-icon";
import ArrowDataTransferHorizontalIcon from "@app/icons/arrow-data-transfer-horizontal-icon";
import ArrowDown01Icon from "@app/icons/arrow-down01-icon";
import ArrowRight01Icon from "@app/icons/arrow-right01-icon";
import CancelCircleIcon from "@app/icons/cancel-circle-icon";
import Cancel01Icon from "@app/icons/cancel01-icon";
import CheckmarkCircle02Icon from "@app/icons/checkmark-circle02-icon";
import Delete02Icon from "@app/icons/delete02-icon";
import Image01Icon from "@app/icons/image01-icon";
import PlusSignCircleIcon from "@app/icons/plus-sign-circle-icon";
import PlusSignIcon from "@app/icons/plus-sign-icon";
import Search01Icon from "@app/icons/search01-icon";
import SparkleIcon from "@app/icons/sparkle-icon";
import StarIcon from "@app/icons/star-icon";
import Tick02Icon from "@app/icons/tick02-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";

// SF Symbols have no browser equivalent, so each name the app uses maps to the closest Hugeicons glyph.
const ICONS = {
    "arrow.left.arrow.right": ArrowDataTransferHorizontalIcon,
    checkmark: Tick02Icon,
    "checkmark.circle.fill": CheckmarkCircle02Icon,
    "chevron.right": ArrowRight01Icon,
    "chevron.up.chevron.down": ArrowDown01Icon,
    "delete.left": Cancel01Icon,
    "exclamationmark.circle.fill": AlertCircleIcon,
    magnifyingglass: Search01Icon,
    photo: Image01Icon,
    plus: PlusSignIcon,
    "plus.circle.fill": PlusSignCircleIcon,
    sparkle: SparkleIcon,
    star: StarIcon,
    trash: Delete02Icon,
    xmark: Cancel01Icon,
    "xmark.circle.fill": CancelCircleIcon,
} as const;

function isKnown(name: string): name is keyof typeof ICONS {
    return name in ICONS;
}

export function SymbolView({
    name,
    size = 20,
    tintColor,
}: {
    name: string;
    size?: number;
    tintColor?: unknown;
    [key: string]: unknown;
}) {
    const icon = isKnown(name) ? ICONS[name] : Search01Icon;
    return (
        <HugeiconsIcon color={typeof tintColor === "string" ? tintColor : "var(--foreground)"} icon={icon} size={size} />
    );
}

import AddCircleSolidIcon from "@app/icons/add-circle-icon";
import AlertCircleSolidIcon from "@app/icons/alert-circle-icon";
import Cancel01Icon from "@app/icons/cancel01-icon";
import CheckmarkCircle02SolidIcon from "@app/icons/checkmark-circle02-icon";
import CircleIcon from "@app/icons/circle-icon";
import Search01Icon from "@app/icons/search01-icon";
import StarIcon from "@app/icons/star-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";

import type { AppSymbol as AppSymbolBase, AppSymbolName } from "./app-symbol";

const GLYPHS = {
    "checkmark.circle.fill": CheckmarkCircle02SolidIcon,
    circle: CircleIcon,
    "exclamationmark.circle.fill": AlertCircleSolidIcon,
    magnifyingglass: Search01Icon,
    "plus.circle.fill": AddCircleSolidIcon,
    star: StarIcon,
    xmark: Cancel01Icon,
} as const satisfies Record<AppSymbolName, IconSvgElement>;

export const AppSymbol: typeof AppSymbolBase = ({ name, size = 24, tintColor }) => (
    <HugeiconsIcon color={tintColor} icon={GLYPHS[name]} size={size} />
);

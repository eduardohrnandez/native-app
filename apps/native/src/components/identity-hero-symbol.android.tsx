import Image01Icon from "@app/icons/image01-icon";
import SparkleIcon from "@app/icons/sparkle-icon";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { View } from "react-native";

import type { IdentityHeroSymbol as IdentityHeroSymbolBase } from "./identity-hero-symbol";

const GLYPHS = { photo: Image01Icon, sparkle: SparkleIcon } as const;

export const IdentityHeroSymbol: typeof IdentityHeroSymbolBase = ({ name, size = 24, tintColor, style }) => (
    <View style={style}>
        <HugeiconsIcon color={tintColor} icon={GLYPHS[name]} size={size} />
    </View>
);

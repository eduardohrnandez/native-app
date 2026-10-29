import { Text } from "react-native";
import type { StyleProp, TextStyle } from "react-native";

interface NumberFlowProps {
    format?: Intl.NumberFormatOptions;
    locales?: string;
    prefix?: string;
    style?: StyleProp<TextStyle>;
    suffix?: string;
    value: number;
}

// The native component animates digits one by one; a browser gets the plain formatted number.
export function NumberFlow({ format, locales, prefix = "", style, suffix = "", value }: NumberFlowProps) {
    const text = new Intl.NumberFormat(locales, format).format(value);
    return <Text style={[{ fontVariant: ["tabular-nums"] }, style]}>{`${prefix}${text}${suffix}`}</Text>;
}

export default NumberFlow;

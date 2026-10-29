import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { StyleProp, TextStyle } from "react-native";
import { StyleSheet } from "react-native";

interface NumberFlowProps {
    format?: Intl.NumberFormatOptions;
    locales?: string;
    prefix?: string;
    style?: StyleProp<TextStyle>;
    suffix?: string;
    value: number;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const LINE = "1.2em";
const ROLL_MS = 700;
const ROLL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const DIGIT = /^\d$/;

interface Cell {
    char: string;
    key: string;
}

// Keyed from the right, so a digit keeps its column when a number grows by a place.
function cells(text: string): Cell[] {
    const chars = [...text];
    return chars.map((char, index) => ({ char, key: `c${chars.length - index}` }));
}

function Digit({ digit, settled }: { digit: number; settled: boolean }) {
    // The hidden in-flow digit gives the box the text's own baseline and width; the rolling column sits over it.
    return (
        <span aria-hidden="true" style={{ clipPath: "inset(0)", display: "inline-block", position: "relative" }}>
            <span style={{ visibility: "hidden" }}>{digit}</span>
            <span
                style={{
                    left: 0,
                    position: "absolute",
                    top: 0,
                    transform: `translateY(calc(${settled ? -digit : 0} * ${LINE}))`,
                    transition: `transform ${ROLL_MS}ms ${ROLL_EASING}`,
                }}
            >
                {DIGITS.map((n) => (
                    <span key={n} style={{ display: "block", height: LINE, lineHeight: LINE }}>
                        {n}
                    </span>
                ))}
            </span>
        </span>
    );
}

// The native component rolls each digit when the value changes; this does the same with a CSS transform.
export function NumberFlow({ format, locales, prefix = "", style, suffix = "", value }: NumberFlowProps) {
    const [settled, setSettled] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setSettled(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const text = new Intl.NumberFormat(locales, format).format(value);
    const flat = StyleSheet.flatten(style);
    const css: CSSProperties = {
        color: typeof flat?.color === "string" ? flat.color : undefined,
        display: "inline-block",
        fontFamily: flat?.fontFamily,
        fontSize: flat?.fontSize,
        fontVariantNumeric: "tabular-nums",
        fontWeight: flat?.fontWeight,
        lineHeight: LINE,
        whiteSpace: "pre",
    };

    return (
        <span aria-label={`${prefix}${text}${suffix}`} role="text" style={css}>
            {prefix}
            {cells(text).map(({ char, key }) =>
                DIGIT.test(char) ? (
                    <Digit digit={Number(char)} key={key} settled={settled} />
                ) : (
                    <span key={key}>{char}</span>
                )
            )}
            {suffix}
        </span>
    );
}

export default NumberFlow;

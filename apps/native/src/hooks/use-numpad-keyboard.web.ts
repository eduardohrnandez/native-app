import { useEffect } from "react";

import type { NumpadKey } from "@/domain/numpad";

const DIGIT_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

function typingTarget(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    );
}

function keyFor(event: KeyboardEvent): NumpadKey | null {
    const digit = DIGIT_KEYS.find((candidate) => candidate === event.key);
    if (digit !== undefined) {
        return digit;
    }
    if (event.key === "." || event.key === ",") {
        return ".";
    }
    if (event.key === "Backspace") {
        return "back";
    }
    return event.key === "Delete" ? "clear" : null;
}

// Typing into a field keeps its own keystrokes, and shortcuts such as Ctrl+C are left alone.
export function useNumpadKeyboard(press: (key: NumpadKey) => void): void {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey || event.altKey || typingTarget(event.target)) {
                return;
            }
            const key = keyFor(event);
            if (key !== null) {
                event.preventDefault();
                press(key);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [press]);
}

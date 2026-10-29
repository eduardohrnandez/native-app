import type { NumpadKey } from "@/domain/numpad";

// Only the web has a physical keyboard to listen to; the phone's keypad is the touch one.
export function useNumpadKeyboard(_press: (key: NumpadKey) => void): void {
    // Nothing to attach on a handset.
}

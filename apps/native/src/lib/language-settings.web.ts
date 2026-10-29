// A browser follows its own language, so there is no per-app setting to hand off to.
export function hasSystemLanguageSettings(): boolean {
    return false;
}

export function openLanguageSettings(): void {
    return undefined;
}

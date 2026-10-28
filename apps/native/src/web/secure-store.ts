// Browsers have no keychain, so the web build keeps these values in localStorage under one prefix.
const PREFIX = "finta.secure.";

function read(key: string): string | null {
    try {
        return globalThis.localStorage?.getItem(`${PREFIX}${key}`) ?? null;
    } catch {
        return null;
    }
}

function write(key: string, value: string): void {
    try {
        globalThis.localStorage?.setItem(`${PREFIX}${key}`, value);
    } catch {
        /* storage blocked: the value lasts only this tab */
    }
}

function remove(key: string): void {
    try {
        globalThis.localStorage?.removeItem(`${PREFIX}${key}`);
    } catch {
        /* storage blocked */
    }
}

export const AFTER_FIRST_UNLOCK = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 1;
export const ALWAYS = 2;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 3;
export const ALWAYS_THIS_DEVICE_ONLY = 4;
export const WHEN_UNLOCKED = 5;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;

export function canUseBiometricAuthentication(): boolean {
    return false;
}

export function getItem(key: string): string | null {
    return read(key);
}

export function setItem(key: string, value: string): void {
    write(key, value);
}

export function deleteItem(key: string): void {
    remove(key);
}

export async function getItemAsync(key: string): Promise<string | null> {
    return await Promise.resolve(read(key));
}

export async function setItemAsync(key: string, value: string): Promise<void> {
    write(key, value);
    await Promise.resolve();
}

export async function deleteItemAsync(key: string): Promise<void> {
    remove(key);
    await Promise.resolve();
}

export async function isAvailableAsync(): Promise<boolean> {
    return await Promise.resolve(true);
}

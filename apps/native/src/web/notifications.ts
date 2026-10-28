// Browsers cannot schedule local reminders, so every call here succeeds without doing anything.
type Listener = () => void;

export const SchedulableTriggerInputTypes = { CALENDAR: "calendar", DAILY: "daily", DATE: "date", TIME_INTERVAL: "timeInterval", WEEKLY: "weekly" };
export const AndroidImportance = { DEFAULT: 3, HIGH: 4, LOW: 2, MAX: 5, MIN: 1, NONE: 0 };

export function setNotificationHandler(): void {}
export async function setNotificationChannelAsync(): Promise<null> {
    return await Promise.resolve(null);
}
export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
    await Promise.resolve();
}
export async function cancelScheduledNotificationAsync(): Promise<void> {
    await Promise.resolve();
}
export async function dismissAllNotificationsAsync(): Promise<void> {
    await Promise.resolve();
}
export async function setBadgeCountAsync(): Promise<boolean> {
    return await Promise.resolve(false);
}
export async function getAllScheduledNotificationsAsync(): Promise<never[]> {
    return await Promise.resolve([]);
}
export async function scheduleNotificationAsync(): Promise<string> {
    return await Promise.resolve("web-unscheduled");
}
export async function getPermissionsAsync() {
    return await Promise.resolve({ canAskAgain: false, expires: "never", granted: false, status: "denied" });
}
export async function requestPermissionsAsync() {
    return await getPermissionsAsync();
}
export function addNotificationResponseReceivedListener(_listener: Listener): { remove: () => void } {
    return { remove: () => undefined };
}
export function getLastNotificationResponse(): null {
    return null;
}
export function clearLastNotificationResponse(): void {}

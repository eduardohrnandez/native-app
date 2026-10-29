import { env } from "@outlayr/env/native";
import { z } from "zod";

const webClientId = env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

export const isGoogleSignInAvailable = Boolean(webClientId);

const POPUP_FEATURES = "width=480,height=640";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CHANNEL_NAME = "finta-google";
const RESULT_KEY = "finta-google-result";
const SIGN_IN_TIMEOUT_MS = 180_000;

const popupMessage = z.object({
    idToken: z.string().nullable(),
    state: z.string().nullable(),
    type: z.literal("finta-google"),
});
// SAFETY: the parsed JSON is checked by `popupMessage` in the next pipe step before anything reads it.
const storedMessage = z
    .string()
    .transform((raw) => JSON.parse(raw) as unknown)
    .pipe(popupMessage);

type PopupMessage = z.infer<typeof popupMessage>;

// Google's implicit flow returns the id token to a redirect page of ours. That page's COOP header severs it from
// this window, so it answers over a BroadcastChannel (with a storage event as backup), not `window.opener`.
export async function googleIdToken(): Promise<string | null> {
    if (!webClientId) {
        return null;
    }
    const state = globalThis.crypto.randomUUID();
    const nonce = globalThis.crypto.randomUUID();
    const query = new URLSearchParams({
        client_id: webClientId,
        nonce,
        prompt: "select_account",
        redirect_uri: `${globalThis.location.origin}/google-callback.html`,
        response_type: "id_token",
        scope: "openid email profile",
        state,
    });
    globalThis.localStorage.removeItem(RESULT_KEY);
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const popup = globalThis.open(`${GOOGLE_AUTH_URL}?${query}`, "finta-google", POPUP_FEATURES);
    if (!popup) {
        channel.close();
        throw new Error("The sign-in window was blocked by the browser");
    }

    return await new Promise<string | null>((resolve) => {
        const finish = (token: string | null) => {
            channel.close();
            globalThis.removeEventListener("storage", onStorage);
            globalThis.clearTimeout(giveUp);
            globalThis.localStorage.removeItem(RESULT_KEY);
            resolve(token);
        };
        const accept = (message: PopupMessage) => {
            if (message.state === state) {
                finish(message.idToken);
            }
        };
        const onStorage = (event: StorageEvent) => {
            const parsed = storedMessage.safeParse(event.newValue);
            if (event.key === RESULT_KEY && parsed.success) {
                accept(parsed.data);
            }
        };
        // A closed popup cannot be seen from here, so an abandoned sign-in simply times out.
        const giveUp = globalThis.setTimeout(() => finish(null), SIGN_IN_TIMEOUT_MS);
        channel.addEventListener("message", (event) => {
            const parsed = popupMessage.safeParse(event.data);
            if (parsed.success) {
                accept(parsed.data);
            }
        });
        globalThis.addEventListener("storage", onStorage);
    });
}

import { env } from "@outlayr/env/native";

const webClientId = env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

export const isGoogleSignInAvailable = Boolean(webClientId);

const POPUP_FEATURES = "width=480,height=640";
const POPUP_POLL_MS = 500;
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

interface PopupMessage {
    idToken: string | null;
    state: string | null;
    type: string;
}

function isPopupMessage(data: unknown): data is PopupMessage {
    return typeof data === "object" && data !== null && "type" in data && data.type === "finta-google";
}

// Google's implicit flow returns the id token to a redirect page of ours, which posts it back to this window.
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
    const popup = globalThis.open(`${GOOGLE_AUTH_URL}?${query}`, "finta-google", POPUP_FEATURES);
    if (!popup) {
        throw new Error("The sign-in window was blocked by the browser");
    }

    return await new Promise<string | null>((resolve) => {
        const finish = (token: string | null) => {
            globalThis.removeEventListener("message", onMessage);
            globalThis.clearInterval(watcher);
            resolve(token);
        };
        const onMessage = (event: MessageEvent<unknown>) => {
            if (event.origin !== globalThis.location.origin || !isPopupMessage(event.data)) {
                return;
            }
            finish(event.data.state === state ? event.data.idToken : null);
        };
        // Closing the popup without choosing an account is a dismissal, not a failure.
        const watcher = globalThis.setInterval(() => {
            if (popup.closed) {
                globalThis.setTimeout(() => finish(null), POPUP_POLL_MS);
            }
        }, POPUP_POLL_MS);
        globalThis.addEventListener("message", onMessage);
    });
}

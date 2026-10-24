import { Redirect } from "expo-router";

// Finta has no plans; any leftover link to the old paywall lands back home.
export default function PaywallRedirect() {
    return <Redirect href="/" />;
}

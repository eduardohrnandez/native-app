// Finta ships no analytics. Call sites keep their optional chaining against a client that never exists.
type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsProperties = Readonly<Record<string, AnalyticsValue>>;

interface AnalyticsClient {
    capture: (event: string, properties?: AnalyticsProperties) => void;
    reset: () => void;
    screen: (name: string) => void;
}

export const posthog: AnalyticsClient | null = null;

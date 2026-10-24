import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

import type { AndroidShortcut } from "./plugins/with-android-shortcuts";

const buildProfile = process.env.EAS_BUILD_PROFILE;
const isProduction = buildProfile === "production";

// Set by `.github/workflows/eas-build.yml`. Local builds fall back to Expo's 1.
const buildNumber = process.env.BUILD_NUMBER;

// Set after `eas init` on your own Expo account; Outlayr's project and OTA server are not ours to use.
const PROJECT_ID = process.env.EAS_PROJECT_ID;

const APP_ID = "com.finta.app";

const APP_GROUP = `group.${APP_ID}`;

const IOS_DEPLOYMENT_TARGET = "18.0";

const ALTERNATE_ICONS: string[] = [];

const WIDGETS = [
    {
        description: "Today's spending, and one tap to add an entry.",
        displayName: "Log an Expense",
        ios: {
            initialLayout: "src/widgets/log.tsx",
            supportedFamilies: ["systemSmall", "accessoryCircular", "accessoryRectangular", "accessoryInline"],
        },
        name: "Log",
    },
    {
        description: "What is left in your overall budget, and how far into the period you are.",
        displayName: "Budget",
        ios: {
            configuration: {
                parameters: {
                    budget: {
                        default: "auto",
                        title: "Budget",
                        type: "enum",
                        values: [
                            { name: "Automatic", value: "auto" },
                            { name: "Overall budget", value: "overall" },
                            { name: "Closest to its limit", value: "worst" },
                        ],
                    },
                },
                title: "Budget",
            },
            initialLayout: "src/widgets/budget.tsx",
            supportedFamilies: [
                "systemSmall",
                "systemMedium",
                "accessoryCircular",
                "accessoryRectangular",
                "accessoryInline",
            ],
        },
        name: "Budget",
    },
    {
        description: "Your most recent entries, newest first.",
        displayName: "Recent Entries",
        ios: {
            configuration: {
                parameters: {
                    measure: {
                        default: "spent",
                        title: "Figure",
                        type: "enum",
                        values: [
                            { name: "Spent", value: "spent" },
                            { name: "Income", value: "income" },
                            { name: "Net", value: "net" },
                        ],
                    },
                    period: {
                        default: "today",
                        title: "Period",
                        type: "enum",
                        values: [
                            { name: "Today", value: "today" },
                            { name: "This week", value: "week" },
                            { name: "This month", value: "month" },
                            { name: "This year", value: "year" },
                        ],
                    },
                },
                title: "Recent Entries",
            },
            initialLayout: "src/widgets/ledger.tsx",
            supportedFamilies: ["systemMedium", "systemLarge", "accessoryRectangular", "accessoryInline"],
        },
        name: "Ledger",
    },
    {
        description: "Spend, income and net for the period, with where the money went.",
        displayName: "Insights",
        ios: {
            configuration: {
                parameters: {
                    period: {
                        default: "app",
                        title: "Period",
                        type: "enum",
                        values: [
                            { name: "Match the app", value: "app" },
                            { name: "This week", value: "week" },
                            { name: "This month", value: "month" },
                            { name: "This year", value: "year" },
                        ],
                    },
                },
                title: "Insights",
            },
            initialLayout: "src/widgets/insights.tsx",
            supportedFamilies: ["systemSmall", "systemMedium"],
        },
        name: "Insights",
    },
];

type QuickAction = AndroidShortcut & { readonly iosIcon: string };

const QUICK_ACTIONS = [
    {
        glyph: "add",
        href: "finta://new",
        id: "log-expense",
        iosIcon: "symbol:plus.circle.fill",
        title: { en: "Log Expense", es: "Registrar gasto" },
    },
    {
        glyph: "income",
        href: "finta://new?income=1",
        id: "log-income",
        iosIcon: "symbol:arrow.down.circle.fill",
        title: { en: "Log Income", es: "Registrar ingreso" },
    },
    {
        glyph: "search",
        href: "finta://search",
        id: "search",
        iosIcon: "symbol:magnifyingglass",
        title: { en: "Search Entries", es: "Buscar" },
    },
    {
        glyph: "budgets",
        href: "finta://budgets",
        id: "budgets",
        iosIcon: "symbol:chart.pie.fill",
        title: { en: "Budgets", es: "Presupuestos" },
    },
] as const satisfies readonly QuickAction[];

const GOOGLE_CLIENT_SUFFIX = /\.apps\.googleusercontent\.com$/i;

function googleIosUrlScheme(clientId: string | undefined): string {
    if (!clientId) {
        return "com.googleusercontent.apps.placeholder";
    }
    if (clientId.startsWith("com.googleusercontent.apps.")) {
        return clientId;
    }
    return `com.googleusercontent.apps.${clientId.replace(GOOGLE_CLIENT_SUFFIX, "")}`;
}

const getConfig = ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    android: {
        adaptiveIcon: {
            backgroundColor: "#1c1d1f",
            foregroundImage: "./assets/images/adaptive-icon.png",
            monochromeImage: "./assets/images/adaptive-icon-monochrome.png",
        },
        // WRITE_EXTERNAL_STORAGE is not blocked: the camera needs it below Android 10,
        // so `with-android-capture` caps it instead.
        blockedPermissions: [
            "android.permission.SYSTEM_ALERT_WINDOW",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.READ_MEDIA_IMAGES",
            "android.permission.READ_MEDIA_VIDEO",
            "com.google.android.c2dm.permission.RECEIVE",
        ],
        package: APP_ID,
        versionCode: buildNumber ? Number(buildNumber) : undefined,
    },
    experiments: {
        inlineModules: {
            watchedDirectories: ["app-intents"],
        },
        reactCompiler: true,
        typedRoutes: true,
    },
    extra: {
        appGroup: APP_GROUP,
        eas: PROJECT_ID ? { projectId: PROJECT_ID } : {},
        primaryAppIcon: isProduction ? "Finta" : "FintaTesting",
        whatsNew: process.env.UPDATE_MESSAGE ?? null,
    },
    ios: {
        buildNumber,
        bundleIdentifier: APP_ID,
        deploymentTarget: IOS_DEPLOYMENT_TARGET,
        entitlements: {
            "com.apple.security.application-groups": [APP_GROUP],
        },
        icon: isProduction ? "./assets/Finta.icon" : "./assets/FintaTesting.icon",
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
        usesAppleSignIn: true,
    },
    locales: {
        es: "./locales/es.json",
    },
    name: "Finta",
    platforms: ["ios", "android"],
    plugins: [
        "expo-router",
        ["expo-localization", { supportedLocales: ["en", "es"] }],
        "expo-image",
        "expo-sqlite",
        [
            "expo-build-properties",
            {
                android: {
                    enableMinifyInReleaseBuilds: true,
                    enableShrinkResourcesInReleaseBuilds: true,
                },
                ios: {
                    deploymentTarget: IOS_DEPLOYMENT_TARGET,
                },
            },
        ],
        [
            "expo-widgets",
            {
                groupIdentifier: APP_GROUP,
                widgets: WIDGETS,
            },
        ],
        "@bacons/apple-targets",
        [
            "expo-quick-actions",
            {
                iosActions: QUICK_ACTIONS.map((action) => ({
                    icon: action.iosIcon,
                    id: action.id,
                    params: { href: action.href },
                    title: action.title.en,
                })),
            },
        ],
        ["./plugins/with-android-shortcuts.ts", { shortcuts: QUICK_ACTIONS }],
        [
            "expo-splash-screen",
            {
                // Must equal `--background`: the splash hands off without a crossfade, so a near miss flashes.
                backgroundColor: "#f2f0ea",
                dark: {
                    backgroundColor: "#17150f",
                    image: "./assets/images/splash-icon-dark.png",
                },
                image: "./assets/images/splash-icon.png",
                imageWidth: 200,
            },
        ],
        "expo-system-ui",
        "expo-apple-authentication",
        "expo-secure-store",
        "expo-web-browser",
        [
            "react-native-nitro-google-signin",
            {
                iosUrlScheme: googleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS),
            },
        ],
        [
            "expo-image-picker",
            {
                cameraPermission: "Finta uses the camera to scan a receipt. The photo goes to Anthropic to read it.",
                photosPermission:
                    "Finta uses your photos to set a custom logo for a transaction or to scan a receipt, which sends that photo to Anthropic to read it.",
            },
        ],
        [
            "expo-local-authentication",
            {
                faceIDPermission: "Finta uses Face ID to unlock your ledger.",
            },
        ],
        [
            "expo-audio",
            {
                // The default adds the `audio` background mode, which App Review rejects as unused (2.5.4).
                enableBackgroundPlayback: false,
                microphonePermission:
                    "Finta listens while you speak an entry. The recording goes to ElevenLabs to write it down for you.",
                recordAudioAndroid: true,
            },
        ],
        [
            "expo-notifications",
            {
                // Android's status bar draws only the alpha, so the asset is the mark in white.
                color: "#c6f432",
                icon: "./assets/images/notification-icon.png",
            },
        ],
        [
            "./plugins/with-alternate-icons.ts",
            {
                icons: ALTERNATE_ICONS.map((name) => `./assets/${name}.icon`),
            },
        ],
        "./plugins/with-android-capture.ts",
        ["posthog-react-native/expo", { skipOnConflict: true }],
        "./plugins/with-android-material-theme.ts",
        [
            "react-native-nano-icons",
            {
                symbolSets: ["tab-symbols", "toolbar-symbols", "menu-symbols"].map((dir) => ({
                    inputDir: `./assets/${dir}`,
                })),
            },
        ],
        "./plugins/with-android-keep-nano-icons.ts",
    ],
    // Fingerprint, not appVersion: config plugins change native code without a version bump,
    // and an update served to a binary with a different native side crashes at launch.
    runtimeVersion: { policy: "fingerprint" },
    scheme: "finta",
    slug: "finta",
    updates: { enabled: false },
    userInterfaceStyle: "automatic",
    version: process.env.APP_VERSION ?? "1.0.0",
});

export default getConfig;

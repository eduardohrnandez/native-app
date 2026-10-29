"use strict";

const { existsSync } = require("node:fs");
const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { configMetroIntlayerSync } = require("react-native-intlayer/metro");
const { withUniwindConfig } = require("uniwind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Skia's `src/index.ts` re-exports a directory, and directory-index resolution only searches crawled files.
const pnpmStore = path.resolve(__dirname, "../../node_modules");
if (!config.watchFolders.includes(pnpmStore)) {
    config.watchFolders.push(pnpmStore);
}

// Drizzle's migrations import `.sql`. Must precede the wrappers, which extend (never reset) the resolver.
config.resolver.sourceExts.push("sql");

// expo-sqlite on the web ships its engine as a wasm asset.
config.resolver.assetExts.push("wasm");

// Outermost, so intlayer chains onto the `.sql` extension and both wrappers. The sync variant leaves the
// dictionaries to `vp run i18n:build`.
const finalConfig = configMetroIntlayerSync(
    withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
        cssEntryFile: "./global.css",
        dtsFile: "./uniwind-types.d.ts",
    })
);

// The AI SDK's `zod/v4` resolves to `.cjs` while the app's `zod` gets `.js`: a second ~500 KB zod.
const upstreamResolveRequest = finalConfig.resolver.resolveRequest;
finalConfig.resolver = {
    ...finalConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
        const resolve = upstreamResolveRequest ?? context.resolveRequest;
        const resolution = resolve(context, moduleName, platform);
        if ((moduleName === "zod" || moduleName.startsWith("zod/")) && resolution.filePath?.endsWith(".cjs")) {
            const esmTwin = resolution.filePath.replace(/\.cjs$/, ".js");
            if (existsSync(esmTwin)) {
                return { ...resolution, filePath: esmTwin };
            }
        }
        return resolution;
    },
};

const SIM_PREVIEW_PATH = "/.sim";

/**
 * Expo's dev server destroys every WebSocket upgrade outside its endpoint map (`@expo/cli` runServer-fork.ts),
 * which silently kills preview touch input. Claim `/.sim` and replay every other upgrade to the original listeners.
 */
function claimSimUpgrades(server, sim) {
    const inherited = server.listeners("upgrade");
    server.removeAllListeners("upgrade");

    server.on("upgrade", (req, socket, head) => {
        if (req.url?.startsWith(SIM_PREVIEW_PATH)) {
            sim.handleUpgrade(req, socket, head);
            return;
        }
        if (inherited.length === 0) {
            socket.destroy();
            return;
        }
        for (const listener of inherited) {
            listener.call(server, req, socket, head);
        }
    });
}

// The web build has no SwiftUI, Compose or PanelUI. Each name below is routed to a web counterpart in `src/web`.
const WEB_NATIVE_ONLY = [
    "expo-core-spotlight",
    "expo-widgets",
    "expo-alternate-app-icons",
    "expo-quick-actions",
    "expo-glass-effect",
    "expo-apple-authentication",
    "expo-store-review",
    "expo-intent-launcher",
    "react-native-nitro-google-signin",
    "react-native-nitro-modules",
    "expo-symbols",
    "expo-mesh-gradient",
    "@shopify/react-native-skia",
];
const WEB_ALIASES = [
    [/^expo-symbols$/, "src/web/symbols.tsx"],
    [/^react-native-reanimated$/, "src/web/reanimated.tsx"],
    [/^expo-notifications$/, "src/web/notifications.ts"],
    [/^expo-file-system$/, "src/web/file-system.ts"],
    [/^expo-secure-store$/, "src/web/secure-store.ts"],
    [/^react-native-web\/dist\/index$/, "src/web/react-native.ts"],
    [new RegExp(`^(${WEB_NATIVE_ONLY.join("|").replaceAll("/", "\\/")})(/.*)?$`), "src/web/any-stub.cjs"],
    [/^@expo\/ui\/swift-ui\/modifiers$/, "src/web/swift-modifiers-entry.cjs"],
    [/^@expo\/ui\/swift-ui$/, "src/web/swift-ui.tsx"],
    [/^@expo\/ui\/jetpack-compose\/modifiers$/, "src/web/modifiers.cjs"],
    [/^@expo\/ui\/jetpack-compose$/, "src/web/any-stub.cjs"],
];
const webResolve = finalConfig.resolver.resolveRequest;
finalConfig.resolver = {
    ...finalConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
        // The shim itself re-exports the real package, so it must not be routed back to itself.
        if (platform === "web" && !context.originModulePath.endsWith("src/web/react-native.ts")) {
            for (const [pattern, file] of WEB_ALIASES) {
                if (pattern.test(moduleName)) {
                    return { filePath: path.resolve(__dirname, file), type: "sourceFile" };
                }
            }
        }
        if (platform === "web") {
            const sqliteDir = path.dirname(require.resolve("expo-sqlite/package.json"));
            // The engine's synchronous calls spin a fixed 1M times before giving up, which migrations outlast.
            // A copy with a far higher limit replaces its worker channel and imports back into the package.
            if (moduleName.startsWith("expo-sqlite/web/")) {
                return {
                    filePath: path.join(sqliteDir, "web", `${moduleName.slice("expo-sqlite/web/".length)}.ts`),
                    type: "sourceFile",
                };
            }
            if (moduleName.startsWith("expo-router-internal/")) {
                const routerDir = path.dirname(require.resolve("expo-router/package.json"));
                const target = moduleName.slice("expo-router-internal/".length);
                return { filePath: path.join(routerDir, "build", target, "index.js"), type: "sourceFile" };
            }
            if (moduleName === "./StackHeaderComponent" && context.originModulePath.includes("stack-utils")) {
                return { filePath: path.resolve(__dirname, "src/web/stack-header.tsx"), type: "sourceFile" };
            }
            if (
                moduleName === "./processHeaderItemsForPlatform" &&
                context.originModulePath.includes("stack-utils/toolbar")
            ) {
                return { filePath: path.resolve(__dirname, "src/web/toolbar-items.tsx"), type: "sourceFile" };
            }
            if (moduleName === "./WorkerChannel" && context.originModulePath.startsWith(path.join(sqliteDir, "web"))) {
                return { filePath: path.resolve(__dirname, "src/web/sqlite-worker-channel.ts"), type: "sourceFile" };
            }
        }
        return (webResolve ?? context.resolveRequest)(context, moduleName, platform);
    },
};

// Assigned after the wrappers because each returns a fresh config object.
finalConfig.server = {
    ...finalConfig.server,
    enhanceMiddleware: (metroMiddleware) => {
        const { simMiddleware } = require("serve-sim/middleware");
        const sim = simMiddleware({ basePath: SIM_PREVIEW_PATH });
        let claimed = false;

        return (req, res, next) => {
            // expo-sqlite on the web needs SharedArrayBuffer, which browsers only expose to isolated pages.
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
            if (!claimed && req.socket?.server) {
                claimed = true;
                claimSimUpgrades(req.socket.server, sim);
            }
            if (req.url?.startsWith(SIM_PREVIEW_PATH)) {
                return sim(req, res, () => metroMiddleware(req, res, next));
            }
            return metroMiddleware(req, res, next);
        };
    },
};

module.exports = finalConfig;

const rnw = require("react-native-web/dist/index");

// A CommonJS module so the overrides below replace react-native-web's exports; `export *` would let them win back.
const out = {};
for (const key of Object.getOwnPropertyNames(rnw)) {
    if (key !== "__esModule") {
        Object.defineProperty(out, key, { configurable: true, enumerable: true, get: () => rnw[key] });
    }
}
Object.defineProperty(out, "__esModule", { value: true });

function override(name, value) {
    Object.defineProperty(out, name, { configurable: true, enumerable: true, value });
}

// react-native-web has no iOS system colors, so these resolve to neutral CSS values.
override("PlatformColor", (...names) => {
    const name = names[0] ?? "";
    if (name.startsWith("systemGray") || name.endsWith("Fill")) {
        return "rgba(128, 128, 128, 0.35)";
    }
    // The theme's own variables, so text follows light and dark like the rest of the app.
    return name.startsWith("secondary") || name.startsWith("tertiary") ? "var(--muted)" : "var(--foreground)";
});

override("DynamicColorIOS", (options) => options.light);

module.exports = out;

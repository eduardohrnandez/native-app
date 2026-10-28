"use strict";

// Modifiers the web renders (see swift-modifiers.ts) pass through; every other name a screen imports is a no-op, so a
// SwiftUI-only modifier or shape never breaks the import.
const real = require("./swift-modifiers.ts");

function deepNoop() {
    const target = () => ({ args: undefined, name: "ignored" });
    return new Proxy(target, { get: (_, key) => (key === "__esModule" ? true : deepNoop()) });
}

module.exports = new Proxy(real, {
    get: (target, key) => {
        if (key in target || typeof key === "symbol") {
            return target[key];
        }
        return key === "default" ? undefined : deepNoop();
    },
});

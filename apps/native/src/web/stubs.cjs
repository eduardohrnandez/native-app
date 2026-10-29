"use strict";

// The web build has no SwiftUI, Compose or other native views. Each export is a plain view that renders its
// children, or a function that resolves to nothing, so a missing native piece never takes the page down.
const { createElement } = require("react");
const { View } = require("react-native");

function createStub(modifiers) {
    const target = function stub(props) {
        if (modifiers) {
            return {};
        }
        const isProps = typeof props === "object" && props !== null && "children" in props;
        // Skia's `style` is a paint mode such as "stroke", which a view would read as a list of style objects.
        const style = typeof props.style === "object" ? props.style : undefined;
        return isProps ? createElement(View, { style }, props.children) : null;
    };
    return new Proxy(target, {
        get: (_, key) => {
            if (key === "__esModule") {
                return true;
            }
            if (key === "prototype" || key === "$$typeof" || key === "isReactComponent" || key === "childContextTypes" || key === "contextTypes" || key === "getDerivedStateFromProps" || key === "contextType" || key === "defaultProps" || key === "propTypes" || key === "displayName") {
                return undefined;
            }
            if (key === "then" || key === Symbol.toPrimitive) {
                return undefined;
            }
            return createStub(modifiers);
        },
    });
}

module.exports = { createStub };

import { objectUrlFor } from "./file-system";

const FILE_ADDRESS = /file:\/\/\/[^"')\s]+/g;

function resolveAddresses(text: string): string {
    return text.replaceAll(FILE_ADDRESS, (address) => objectUrlFor(address) ?? address);
}

// Photos live in the browser file system, which a page cannot load by their file:// address. react-native-web draws an
// image as a CSS background and preloads it through an Image element, and the packages that wrap it may carry their own
// copy, so the two browser entry points are patched instead of any one component.
function patchSetter(proto: object, property: string): void {
    const descriptor = Object.getOwnPropertyDescriptor(proto, property);
    const set = descriptor?.set;
    if (descriptor === undefined || set === undefined) {
        return;
    }
    Object.defineProperty(proto, property, {
        ...descriptor,
        set(value: unknown) {
            set.call(this, typeof value === "string" ? resolveAddresses(value) : value);
        },
    });
}

patchSetter(HTMLImageElement.prototype, "src");
// react-native-web paints images as inline backgrounds; engines differ on where that accessor lives, so the
// attribute is rewritten after React writes it.
function rewriteBackground(element: HTMLElement): void {
    const current = element.style.backgroundImage;
    if (current.includes("file:///")) {
        element.style.backgroundImage = resolveAddresses(current);
    }
}

function rewriteTree(root: Element): void {
    if (root instanceof HTMLElement) {
        rewriteBackground(root);
    }
    for (const element of root.querySelectorAll<HTMLElement>('[style*="file:///"]')) {
        rewriteBackground(element);
    }
}

new MutationObserver((records) => {
    for (const record of records) {
        if (record.type === "attributes" && record.target instanceof HTMLElement) {
            rewriteBackground(record.target);
            continue;
        }
        for (const node of record.addedNodes) {
            if (node instanceof Element) {
                rewriteTree(node);
            }
        }
    }
}).observe(document.documentElement, {
    attributeFilter: ["style"],
    attributes: true,
    childList: true,
    subtree: true,
});

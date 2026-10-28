// SwiftUI modifiers become plain records; `swift-ui.tsx` turns the ones the web understands into styles and props.
export interface WebModifier {
    args: unknown;
    name: string;
}

function modifier(name: string) {
    return (args?: unknown): WebModifier => ({ args, name });
}

export const accessibilityAddTraits = modifier("accessibilityAddTraits");
export const accessibilityElement = modifier("accessibilityElement");
export const accessibilityHidden = modifier("accessibilityHidden");
export const accessibilityLabel = modifier("accessibilityLabel");
export const accessibilityValue = modifier("accessibilityValue");
export const blur = modifier("blur");
export const buttonStyle = modifier("buttonStyle");
export const containerBackground = modifier("containerBackground");
export const environment = modifier("environment");
export const font = modifier("font");
export const foregroundStyle = modifier("foregroundStyle");
export const frame = modifier("frame");
export const labelsHidden = modifier("labelsHidden");
export const lineLimit = modifier("lineLimit");
export const minimumScaleFactor = modifier("minimumScaleFactor");
export const monospacedDigit = modifier("monospacedDigit");
export const multilineTextAlignment = modifier("multilineTextAlignment");
export const onSubmit = modifier("onSubmit");
export const onTapGesture = modifier("onTapGesture");
export const opacity = modifier("opacity");
export const overlay = modifier("overlay");
export const padding = modifier("padding");
export const pickerStyle = modifier("pickerStyle");
export const progressViewStyle = modifier("progressViewStyle");
export const scrollDismissesKeyboard = modifier("scrollDismissesKeyboard");
export const submitLabel = modifier("submitLabel");
export const tag = modifier("tag");
export const textCase = modifier("textCase");
export const textInputAutocapitalization = modifier("textInputAutocapitalization");
export const tint = modifier("tint");
export const widgetURL = modifier("widgetURL");
export const accessibilityInputLabels = modifier("accessibilityInputLabels");
export const animation = modifier("animation");
export const background = modifier("background");
export const datePickerStyle = modifier("datePickerStyle");
export const deleteDisabled = modifier("deleteDisabled");
export const fixedSize = modifier("fixedSize");
export const gaugeStyle = modifier("gaugeStyle");
export const id = modifier("id");
export const italic = modifier("italic");
export const kerning = modifier("kerning");
export const layoutPriority = modifier("layoutPriority");
export const listRowBackground = modifier("listRowBackground");
export const listRowInsets = modifier("listRowInsets");
export const listRowSeparator = modifier("listRowSeparator");
export const listStyle = modifier("listStyle");
export const offset = modifier("offset");
export const onAppear = modifier("onAppear");
export const scrollContentBackground = modifier("scrollContentBackground");
export const scrollPosition = modifier("scrollPosition");
export const scrollTargetLayout = modifier("scrollTargetLayout");

/** Animation curves are a native concern; the web only needs something callable. */
export const Animation = new Proxy({} as Record<string, () => object>, {
    get: () => () => ({}),
});

export type ViewModifier = WebModifier;

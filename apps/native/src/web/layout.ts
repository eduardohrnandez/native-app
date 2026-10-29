import type { DimensionValue } from "react-native";

// Wide windows keep content in a readable centered column while headers and backgrounds still span the window.
export const CONTENT_MAX_WIDTH = 880;

// SAFETY: react-native-web passes this string straight to CSS, which DimensionValue's typings do not allow for calc().
export const HEADER_INSET = `max(0px, calc((100% - ${CONTENT_MAX_WIDTH}px) / 2))` as DimensionValue;

export const CONTENT_STYLE = { alignSelf: "center", maxWidth: CONTENT_MAX_WIDTH, width: "100%" } as const;

// The web header supports these container styles, though the native-stack option types leave them out; spread this in
// rather than writing the keys inline.
export const HEADER_INSETS = {
    headerLeftContainerStyle: { paddingLeft: HEADER_INSET },
    headerRightContainerStyle: { paddingRight: HEADER_INSET },
};

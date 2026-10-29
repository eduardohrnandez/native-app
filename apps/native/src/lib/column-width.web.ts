import { CONTENT_MAX_WIDTH } from "@/web/layout";

// Wide windows keep content in a centered column, so a width taken from the window would overflow it.
export function columnWidth(windowWidth: number): number {
    return Math.min(windowWidth, CONTENT_MAX_WIDTH);
}

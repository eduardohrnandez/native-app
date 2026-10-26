import { convex } from "@/lib/convex";

// Finta has no plans: nothing is sold, so no gate ever locks. A build with a backend entitles its cloud features
// (sync, photo backup, AI) to whoever signs in, the way a free app would.
export function proSellable(): boolean {
    return false;
}

export function useProLocked(): boolean {
    return false;
}

export function useProEntitled(): boolean {
    return convex !== null;
}

export function useProPending(): boolean {
    return false;
}

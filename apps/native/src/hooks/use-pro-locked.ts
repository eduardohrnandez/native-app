// Finta has no plans: nothing is sold, so no gate ever locks and no server-gated capability is entitled.
export function proSellable(): boolean {
    return false;
}

export function useProLocked(): boolean {
    return false;
}

export function useProEntitled(): boolean {
    return false;
}

export function useProPending(): boolean {
    return false;
}

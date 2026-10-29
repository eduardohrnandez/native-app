import type { NativeStackNavigationOptions } from "expo-router";
import { useMemo } from "react";

import type { MaterialRoleColors } from "@/theme/material-roles";
import { useColors } from "@/theme/use-colors";

import type { StackChrome } from "./stack-chrome";

type Options = NativeStackNavigationOptions;

// A browser cannot inset content under a transparent header or present a native sheet, so every screen gets a
// solid bar and sheets become ordinary pushed pages.
function webChrome(background: string, foreground: string): StackChrome {
    const bar: Options = {
        headerShadowVisible: false,
        headerShown: true,
        headerStyle: { backgroundColor: background },
        headerTintColor: foreground,
        headerTitleAlign: "left",
        headerTransparent: false,
    };
    const page = (title: string): Options => ({ ...bar, title });
    return {
        bareModal: { headerShown: false },
        entrySheet: page(""),
        firstRunStep: { animation: "fade", headerShadowVisible: false, headerTransparent: true, title: "" },
        identityPicker: () => ({ ...bar, title: "" }),
        modal: page,
        paywall: page(""),
        pickerSheet: () => ({ ...bar, title: "" }),
        pushed: bar,
        search: page,
        sheet: ({ title }) => page(title),
        titled: page,
    };
}

export function stackChrome(_m3: MaterialRoleColors): StackChrome {
    return webChrome("transparent", "inherit");
}

export function useStackChrome(): StackChrome {
    const { background, foreground } = useColors();
    return useMemo(() => webChrome(background, foreground), [background, foreground]);
}

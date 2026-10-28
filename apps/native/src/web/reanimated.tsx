import type { ComponentType } from "react";
import RealAnimated from "react-native-reanimated/lib/module/index";

export * from "react-native-reanimated/lib/module/index";

interface LayoutProps {
    entering?: unknown;
    exiting?: unknown;
    layout?: unknown;
}

// Reanimated's web layout animations leave elements absolutely positioned and collapse their parents.
function withoutLayoutAnimation<P extends object>(Component: ComponentType<P>): ComponentType<P & LayoutProps> {
    return function Plain({ entering: _entering, exiting: _exiting, layout: _layout, ...rest }: P & LayoutProps) {
        return <Component {...(rest as unknown as P)} />;
    };
}

const Animated = {
    ...RealAnimated,
    FlatList: withoutLayoutAnimation(RealAnimated.FlatList as ComponentType<object>),
    Image: withoutLayoutAnimation(RealAnimated.Image as ComponentType<object>),
    ScrollView: withoutLayoutAnimation(RealAnimated.ScrollView as ComponentType<object>),
    Text: withoutLayoutAnimation(RealAnimated.Text as ComponentType<object>),
    View: withoutLayoutAnimation(RealAnimated.View as ComponentType<object>),
    createAnimatedComponent: (component: ComponentType<object>) =>
        withoutLayoutAnimation(RealAnimated.createAnimatedComponent(component) as ComponentType<object>),
};

export default Animated;

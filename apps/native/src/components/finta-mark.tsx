import Svg, { Circle, G, Path, Rect } from "react-native-svg";

const TILE = "#1c1d1f";
const LIME = "#c6f432";
const FUTURE = "#e9eadf";
const MONTH_RADIUS = 4.5;
const CURRENT_MONTH_RADIUS = 8;
// Below this the F crowds the ring, so small marks show the ring alone.
const MIN_SIZE_WITH_F = 48;

const PAST_MONTHS = [
    [50, 20],
    [65, 24.02],
    [75.98, 35],
    [80, 50],
    [75.98, 65],
    [65, 75.98],
    [50, 80],
    [35, 75.98],
    [24.02, 65],
] as const;

const FUTURE_MONTHS = [
    [24.02, 35],
    [35, 24.02],
] as const;

export function FintaMark({ size = 92 }: { size?: number }) {
    return (
        <Svg height={size} viewBox="0 0 100 100" width={size}>
            <Rect fill={TILE} height={100} rx={23} width={100} x={0} y={0} />
            <Path
                d="M50 20 A30 30 0 1 1 20 50"
                fill="none"
                stroke={LIME}
                strokeLinecap="round"
                strokeOpacity={0.45}
                strokeWidth={3}
            />
            <G fill={LIME}>
                {PAST_MONTHS.map(([cx, cy]) => (
                    <Circle cx={cx} cy={cy} key={`${cx}-${cy}`} r={MONTH_RADIUS} />
                ))}
                <Circle cx={20} cy={50} r={CURRENT_MONTH_RADIUS} />
            </G>
            <G fill={FUTURE} fillOpacity={0.35}>
                {FUTURE_MONTHS.map(([cx, cy]) => (
                    <Circle cx={cx} cy={cy} key={`${cx}-${cy}`} r={MONTH_RADIUS} />
                ))}
            </G>
            {size >= MIN_SIZE_WITH_F ? (
                <>
                    <Path
                        d="M43 66 V36 H61"
                        fill="none"
                        stroke={LIME}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={8}
                    />
                    <Path d="M43 51 H56" fill="none" stroke={LIME} strokeLinecap="round" strokeWidth={8} />
                </>
            ) : null}
        </Svg>
    );
}

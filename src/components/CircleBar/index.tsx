import styled from "styled-components";
import useTheme from "../../hooks/useTheme";

const SVG = styled.svg<{ width: number | string; height: number | string }>`
	display: flex;
	width: ${({ width }) => `${width}px`};
	height: ${({ height }) => `${height}px`};
`;

const Path = styled.path<{ percent?: number }>`
	stroke-dasharray: 292.273, 292.273;
	stroke-dashoffset: ${({ percent }) => (percent ? Math.floor(292.273 - (292.273 * percent) / 100) : 292.273)};
`;

export type CircleBarProps = {
	width?: number | string;
	height?: number | string;
	stroke?: string;
	fill?: string;
	percent?: number;
};

const CircleBar = ({
	width = 24,
	height = 24,
	stroke = "rgba(255, 255, 255, 0.15)",
	fill,
	percent = 0,
}: CircleBarProps) => {
	const theme = useTheme();

	return (
		<SVG viewBox="0 0 100 100" width={width} height={height}>
			<path
				d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93"
				stroke={stroke}
				strokeWidth="7"
				fillOpacity="0"
			/>
			<Path
				d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93"
				stroke={fill || theme.primary}
				percent={percent}
				strokeWidth="7"
				fillOpacity="0"
			/>
		</SVG>
	);
};

export default CircleBar;

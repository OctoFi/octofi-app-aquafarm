import styled, { keyframes } from "styled-components";
import useTheme from "../../hooks/useTheme";

const fill = keyframes`
  from {
    stroke-dashoffset: 0;
  }
  
  to {
    stroke-dashoffset: 292.273;
  }
`;

const SVG = styled.svg`
	display: flex;
	width: ${({ width }) => `${width}px`};
	height: ${({ height }) => `${height}px`};
`;

const Path = styled.path`
	stroke-dasharray: 292.273, 292.273;
	animation: ${fill} 15s linear infinite forwards;
`;

export type CircleLoadingProps = {
	width?: number | string;
	height?: number | string;
	loading?: boolean;
	priceLoading?: boolean;
	stroke?: string;
	fill?: string;
};

const CircleLoading = ({
	width = 24,
	height = 24,
	loading = false,
	priceLoading = false,
	stroke = "#eee",
	fill,
}: CircleLoadingProps) => {
	const theme = useTheme();

	return (
		<SVG viewBox="0 0 100 100" width={width} height={height}>
			<path
				d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93"
				stroke={stroke}
				strokeWidth="2"
				fillOpacity="0"
			/>
			{!loading && !priceLoading && (
				<Path
					d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93"
					stroke={fill || theme.primary}
					strokeWidth="7"
					fillOpacity="0"
				/>
			)}
		</SVG>
	);
};

export default CircleLoading;

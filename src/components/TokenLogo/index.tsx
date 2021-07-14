import { useState } from "react";
import SVG from "react-inlinesvg";
import { ImageProps } from "rebass";
import styled from "styled-components";
import QuestionMark from "../../assets/images/question-mark.svg";

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export interface LogoProps extends Pick<ImageProps, "style" | "alt" | "className"> {
	srcs: string[];
}

const BadSource = styled.div`
	width: 100%;
	height: 100%;
	border-radius: 300px;
	background-color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.primary};
`;

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps) {
	const [, refresh] = useState<number>(0);

	const src: string | undefined = srcs.find((src) => !BAD_SRCS[src]);

	if (src) {
		return (
			<img
				{...rest}
				alt={alt}
				src={src}
				onError={() => {
					if (src) BAD_SRCS[src] = true;
					refresh((i) => i + 1);
				}}
			/>
		);
	}

	return (
		<BadSource {...rest}>
			<SVG src={QuestionMark} />
		</BadSource>
	);
}

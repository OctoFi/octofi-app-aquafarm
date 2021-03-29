import React from "react";
import styled from "styled-components";

import { toAbsoluteUrl } from "../../lib/helper";

const LogoImage = styled.img`
	width: 100%;
	height: 100%;
	border-radius: 1000px;
	display: block;
`;

const Wrapper = styled.div`
	width: ${({ size }) => `${size}px`};
	height: ${({ size }) => `${size}px`};
	min-width: ${({ size }) => `${size}px`};
	min-height: ${({ size }) => `${size}px`};
	flex-basis: ${({ size }) => `${size}px`};
	border-radius: 1000px;
	border: 2px solid ${({ theme }) => theme.text1};
`;

const PlatformLogo = (props) => {
	return (
		<Wrapper size={props.size}>
			<LogoImage
				src={toAbsoluteUrl(
					`/media/platforms/${props.platform.toLowerCase()}.${
						props.platform.toLowerCase() === "curve" ? "png" : "svg"
					}`
				)}
				alt={props.name}
			/>
		</Wrapper>
	);
};

export default PlatformLogo;

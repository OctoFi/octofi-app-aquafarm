import styled, { ThemeContext } from "styled-components";
import { useContext } from "react";

import "./style.scss";

const Wrapper = styled.div`
	width: ${({ width }) => `${width || 55}px`};
	height: ${({ height }) => `${height || 55}px`};
`;

const Loading = (props) => {
	let color = "primary";
	let customColor = false;
	const theme = useContext(ThemeContext);
	const classNames = ["loading-spine"];

	if (props.active || props.color === "success") {
		classNames.push("active");
	} else if (props.failed || props.color === "danger") {
		classNames.push("failed");
	}

	if (["primary", "secondary", "danger", "warning", "success", "tertiary"].includes(props.color)) {
		color = props.color;
	} else {
		customColor = props.color;
	}

	return (
		<Wrapper color={props.color} width={props.width} height={props.height} className={classNames.join(" ")}>
			<svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="44" cy="44" r="38.5" stroke="white" strokeOpacity="0.07" strokeWidth="11" />
				<mask id={`path-2-inside-${props.id}`} fill="white">
					<path d="M11.3657 23.5322C8.80255 21.9247 8.00317 18.5169 9.91657 16.1733C15.2963 9.58384 22.4998 4.66252 30.6818 2.06404C40.6129 -1.08993 51.341 -0.617078 60.9562 3.39842C70.5713 7.41391 78.4493 14.7114 83.1876 23.9917C87.9259 33.272 89.2169 43.9326 86.8308 54.0757C84.4448 64.2187 78.5364 73.1858 70.1578 79.3804C61.7791 85.575 51.4739 88.595 41.077 87.9028C30.6801 87.2106 20.8663 82.8511 13.3828 75.6004C7.21733 69.6268 2.96332 62.0102 1.08548 53.7135C0.417581 50.7626 2.65237 48.0686 5.66336 47.7723C8.67436 47.476 11.311 49.6978 12.1001 52.6186C13.6444 58.3344 16.7065 63.5651 21.0068 67.7316C26.6268 73.1768 33.9969 76.4507 41.8049 76.9706C49.6129 77.4904 57.3519 75.2224 63.6442 70.5703C69.9365 65.9183 74.3736 59.1841 76.1655 51.5667C77.9575 43.9494 76.9879 35.9433 73.4295 28.974C69.8711 22.0046 63.9548 16.5242 56.7339 13.5086C49.5131 10.493 41.4563 10.1379 33.9981 12.5065C28.2914 14.3189 23.2185 17.636 19.288 22.0638C17.2794 24.3265 13.9288 25.1398 11.3657 23.5322Z" />
				</mask>
				<path
					d="M11.3657 23.5322C8.80255 21.9247 8.00317 18.5169 9.91657 16.1733C15.2963 9.58384 22.4998 4.66252 30.6818 2.06404C40.6129 -1.08993 51.341 -0.617078 60.9562 3.39842C70.5713 7.41391 78.4493 14.7114 83.1876 23.9917C87.9259 33.272 89.2169 43.9326 86.8308 54.0757C84.4448 64.2187 78.5364 73.1858 70.1578 79.3804C61.7791 85.575 51.4739 88.595 41.077 87.9028C30.6801 87.2106 20.8663 82.8511 13.3828 75.6004C7.21733 69.6268 2.96332 62.0102 1.08548 53.7135C0.417581 50.7626 2.65237 48.0686 5.66336 47.7723C8.67436 47.476 11.311 49.6978 12.1001 52.6186C13.6444 58.3344 16.7065 63.5651 21.0068 67.7316C26.6268 73.1768 33.9969 76.4507 41.8049 76.9706C49.6129 77.4904 57.3519 75.2224 63.6442 70.5703C69.9365 65.9183 74.3736 59.1841 76.1655 51.5667C77.9575 43.9494 76.9879 35.9433 73.4295 28.974C69.8711 22.0046 63.9548 16.5242 56.7339 13.5086C49.5131 10.493 41.4563 10.1379 33.9981 12.5065C28.2914 14.3189 23.2185 17.636 19.288 22.0638C17.2794 24.3265 13.9288 25.1398 11.3657 23.5322Z"
					stroke={`url(#paint0_linear-${props.id})`}
					strokeWidth="22"
					strokeLinecap="round"
					strokeLinejoin="round"
					mask={`url(#path-2-inside-${props.id})`}
				/>
				<defs>
					<linearGradient
						id={`paint0_linear-${props.id}`}
						x1="67.1"
						y1="11"
						x2="1.1"
						y2="40.7"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor={customColor || theme[color]} />
						<stop offset="1" stopColor={customColor || theme[color]} stopOpacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</Wrapper>
	);
};

export default Loading;

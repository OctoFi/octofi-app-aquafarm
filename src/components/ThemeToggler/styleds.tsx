import styled, { keyframes } from "styled-components";

const CubicBezier = "cubic-bezier(0.38, 0.24, 0.28, 1.17)";

const checkSwitch = keyframes`
    0% {
        transform: translateX(0);
    }
    50% {
        width: 36px;
        transform: translateX(0);
    }
    100% {
        width: 20px;
        transform: translateX(22px);
    }
`;

const checkSwitchAfter = keyframes`
    from {
        transform: translateX(-40px) scale(0.2);
    }
    to {
        transform: translateX(0) scale(1);
    }
`;

const unCheckSwitchAfter = keyframes`
	from {
		transform: translateX(0) scale(1);
	}
	to {
		transform: translateX(40px) scale(0.2);
	}
`;

const unCheckSwitch = keyframes`
	0% {
		width: 20px;
		transform: translateX(22px);
	}
	50% {
		width: 36px;
		transform: translateX(0);
	}
	100% {
		transform: translateX(0);
	}
`;

export const Switch = styled.label`
	position: relative;
	display: inline-block;
	cursor: pointer;
	margin-bottom: 0;
`;

// Hide input
export const SwitchInput = styled.input`
	opacity: 0;
	visibility: hidden;
	width: 1px;
	height: 1px;
	background-color: transparent;
	pointer-events: none;
	position: absolute;
`;

export const SwitchBg = styled.div`
	position: absolute;
	width: 38px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	top: 4px;
	left: 4px;
`;

export const SwitchBox = styled.div`
	padding: 3px;
	border-radius: 100px;
	position: relative;
	height: 26px;
	width: 48px;
	box-shadow: 0 0 10px transparent;
	transition: 0.4s all ${CubicBezier};
	overflow: hidden;
	background-color: #e4ecfa;

	.dark-mode & {
		background-color: #565a69;
	}

	// Before for background changes
	&::before {
		content: "";
		width: 120%;
		height: 110%;
		position: absolute;
		top: -5%;
		left: -10%;
		border-radius: 100px;
		transform: translateX(-100%);
		transition: 0.3s ease all;
		will-change: transform, border-radius;
		background-color: ${({ theme }) => theme.primary};
	}

	${SwitchInput}:checked ~ & {
		&::before {
			transform: translateX(0);
			border-radius: 20px;
		}
	}
`;

export const SwitchBoxInner = styled.span`
	position: absolute;
	width: 20px;
	height: 20px;
	border-radius: 100px;
	background-color: #fff;
	transform: translateX(0);
	transition: 0.4s all ${CubicBezier};
	overflow: hidden;

	&::after {
		content: "";
		height: 4px;
		width: 4px;
		border-radius: 10px;
		top: 8px;
		left: 8px;
		position: absolute;
		transform: translateX(-40px);
		background-color: ${({ theme }) => theme.primary};
	}

	// Animation on check input
	${SwitchInput}:checked ~ ${SwitchBox} > & {
		animation: ${checkSwitch} 0.4s ${CubicBezier} forwards;

		&::after {
			animation: ${checkSwitchAfter} 0.4s ${CubicBezier} 0.2s forwards;
		}
	}

	// Animation on uncheck
	${SwitchInput}:not(:checked) ~ ${SwitchBox} > & {
		transform: translateX(-20px);
		animation: ${unCheckSwitch} 0.4s ${CubicBezier} forwards;

		&::after {
			animation: ${unCheckSwitchAfter} 0.4s ${CubicBezier} forwards;
		}
	}
`;

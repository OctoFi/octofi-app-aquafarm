import styled from "styled-components";
import { Button as BS } from "react-bootstrap";

export const Button = styled(BS)`
	height: 48px;
	min-height: 48px;
	min-width: 125px;
`;

export const Wrapper = styled.div`
	${({ theme }) => theme.flexColumnNoWrap}
	margin: 0;
	padding: 0;
	width: 100%;
	background-color: ${({ theme }) => theme.bg1};
`;

export const HeaderRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	padding: 1.5rem 1.5rem;
	font-weight: 500;
	color: ${(props) => (props.color === "blue" ? ({ theme }) => theme.primary : "inherit")};
	${({ theme }) => theme.mediaWidth.upToMedium`
        padding: 1rem;
    `};
`;

export const HoverText = styled.div`
	&:hover {
		cursor: pointer;
	}
`;

export const ContentWrapper = styled.div`
	width: 100%;
	background-color: ${({ theme }) => theme.bg1};
	padding: 2rem;
	${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`;

export const UpperSection = styled.div`
	position: relative;
	width: 100%;

	h5 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 400;

		&:last-child {
			margin-bottom: 0;
		}
	}

	h4 {
		margin-top: 0;
		font-weight: 500;
	}
`;

export const LogoBox = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	width: 46px;
	height: 46px;
	object-fit: contain;
	box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.04);
	border: solid 0.5px rgba(0, 0, 0, 0.1);
	border-radius: 100%;
	margin: auto;

	img {
		height: 24px;
		width: 24px;
		display: block;
	}
`;

export const ErrorTip = styled.div`
	text-align: center;
`;

export const ConfirmContent = styled.div`
	width: 100%;
`;

export const TxnsInfoText = styled.div`
	font-size: 22px;
	font-weight: 500;
	font-stretch: normal;
	font-style: normal;
	line-height: 1;
	letter-spacing: -0.0625rem;
	text-align: center;
	color: ${({ theme }) => theme.text1};
	margin-top: 1rem;
`;

export const ConfirmText = styled.div`
	width: 100%;
	font-size: 0.75rem;
	font-weight: bold;
	font-stretch: normal;
	font-style: normal;
	line-height: 1;
	letter-spacing: normal;
	text-align: center;
	color: #734be2;
	padding: 1.25rem 0;
	border-top: 0.0625rem solid rgba(0, 0, 0, 0.08);
	margin-top: 1.25rem;
`;

export const ButtonConfirm = styled(Button)`
	max-width: 272px;
	height: 48px;
	line-height: 1;
	margin: auto;
	font-size: 1rem;
`;

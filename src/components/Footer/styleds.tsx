import styled from "styled-components";
import { Link } from "react-router-dom";

export const Footer = styled.footer<{ desktop: string; mobile: string }>`
	background-color: ${({ theme }) => theme.modalBG};
	border: 1px solid ${({ theme }) => theme.text4};
	border-bottom-width: 0;
	border-radius: 18px;
	padding: 74px 70px 115px;
	margin: 113px -86px -1px;
	position: relative;

	@media (max-width: 991px) {
		margin: 82px 0 0;

		padding: 21px 24px 40px;
	}

	&::before {
		content: "";
		width: 270px;
		height: 290px;
		position: absolute;
		right: 32px;
		top: -102px;
		background-image: url(${({ desktop }) => desktop});
		background-repeat: no-repeat;
		background-size: contain;

		@media (max-width: 991px) {
			background-image: url(${({ mobile }) => mobile});
			width: 149px;
			height: 158px;
			right: 0;
			top: -72px;
		}
	}
`;

export const Content = styled.div`
	z-index: 10;
	position: relative;
`;

export const About = styled.div`
	width: 275px;
`;

export const Background = styled.div<{ imageOne: string; imageTwo: string }>`
	position: absolute;
	z-index: 1;
	width: 100%;
	height: 100%;
	border-radius: 18px;
	top: 0;
	left: 0;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: -46px;
		left: 0;
		background-image: url(${({ imageOne }) => imageOne});
		background-size: 876px 331px;
		background-repeat: no-repeat;
		width: 876px;
		height: 331px;

		@media (max-width: 991px) {
			bottom: -9px;
			left: -130px;
			right: auto;
			background-size: 705px 267px;
			width: 705px;
			height: 267px;
		}
	}

	&::after {
		content: "";
		position: absolute;
		bottom: -9px;
		right: 42px;
		background-image: url(${({ imageTwo }) => imageTwo});
		background-size: 810px 282px;
		background-repeat: no-repeat;
		width: 810px;
		height: 282px;
		z-index: 1;

		@media (max-width: 991px) {
			bottom: -197px;
			left: -369px;
			right: auto;
			background-size: 827px 288px;
			width: 827px;
			height: 288px;
		}
	}
`;

export const MobileSocials = styled.div`
	padding-top: 60px;
`;

export const LogoContainer = styled.div`
	margin-bottom: 67px;

	@media (max-width: 991px) {
		margin-bottom: 0;
	}
`;

export const CopyRight = styled.div`
	font-size: 0.875rem;

	&.link {
		color: inherit;
		text-decoration: none;

		&:hover {
			text-decoration: none;
			color: ${({ theme }) => theme.text2};
		}
	}
`;

export const ListContainer = styled.div`
    flex: 1;
`;

export const ListWrap = styled.div`
	padding-top: 96px;

	@media (max-width: 991px) {
		padding-top: 47px;
		flex-wrap: wrap;
	}
`;

export const List = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0 45px 0 0;

	@media (max-width: 991px) {
		padding-right: 16px;
		flex-basis: 50%;
	}
`;

export const ParentLink = styled(Link)`
	color: ${({ theme }) => theme.primary};
	margin-bottom: 24px;
	font-weight: 500;
	text-decoration: none;
	display: block;
	white-space: nowrap;
	font-size: 0.875rem;

	&:hover {
		text-decoration: none;
		outline: none;
		color: ${({ theme }) => theme.text1};
	}
`;

export const NestedLink = styled(ParentLink)`
	color: ${({ theme }) => theme.text1};
	margin-bottom: 22px;
	font-weight: 400;

	&:hover {
		color: ${({ theme }) => theme.text2};
	}
`;

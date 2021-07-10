import { useContext } from "react";
import { Link } from "react-router-dom";
import styled, { ThemeContext } from "styled-components";
import LogoImage from "../../assets/images/logo.svg";
import { TYPE } from "../../theme";

export const StyledLink = styled(Link)`
	display: flex;
	align-items: center;
	text-decoration: none !important;
	position: relative;
	margin-right: 0;
`;

export const StyledImg = styled.img`
	width: 35px;
	height: 25px;
	margin-right: 6px;
`;

export type LogoProps = {
	hideOnMobile?: boolean;
};

const Logo = ({ hideOnMobile }: LogoProps) => {
	const theme = useContext(ThemeContext);
	return (
		<StyledLink to={"/"}>
			<StyledImg src={LogoImage} alt={process.env.REACT_APP_BRAND} />
			<TYPE.Black
				fontSize={15}
				color={theme.text1}
				fontWeight={700}
				className={`${hideOnMobile ? "d-none d-lg-block" : ""}`}
			>
				{process.env.REACT_APP_BRAND}
			</TYPE.Black>
		</StyledLink>
	);
};

export default Logo;

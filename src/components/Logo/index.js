import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "styled-components";
import LogoImage from "../../assets/images/logo.svg";
import { TYPE } from "../../theme";

const Logo = (props) => {
	const theme = useContext(ThemeContext);
	return (
		<Link to={"/"} className={"header__logo"}>
			<img src={LogoImage} alt={process.env.REACT_APP_BRAND} className={"header__logo-img"} />
			<TYPE.Black
				fontSize={15}
				color={theme.text1}
				fontWeight={700}
				className={`${props.hideOnMobile ? "d-none d-lg-block" : ""}`}
			>
				{process.env.REACT_APP_BRAND}
			</TYPE.Black>
		</Link>
	);
};

export default Logo;

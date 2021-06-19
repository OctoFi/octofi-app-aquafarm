import { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { Link, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";

import ArrowDown from "../../assets/images/global/arrow-down.svg";
import { useActiveWeb3React } from "../../hooks";
import UserIcon from "../Icons/User";
import { Wrapper, Item, DropDown } from "./styles";

const Button = styled.button`
	margin-right: 0.75rem;
`;

const DropDownItem = styled(Link)`
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 20px;
	outline: none;
	text-decoration: none;
	white-space: nowrap;
	color: ${({ theme }) => theme.text1};

	&:not(:last-child) {
		margin-bottom: 20px;
	}

	&:hover,
	&:focus,
	&:active {
		color: ${({ theme }) => theme.text2};
		box-shadow: none;
		outline: none;
		text-decoration: none;
	}

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 6px;
		width: 10px;
		height: 10px;
		border-radius: 10px;
		background-color: ${({ theme }) => theme.success};
	}
`;

const DropDownButton = styled.button`
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 20px;
	outline: none;
	text-decoration: none;
	white-space: nowrap;
	border: none;
	background-color: transparent;
	color: ${({ theme }) => theme.text1};

	&:not(:last-child) {
		margin-bottom: 20px;
	}

	&:hover,
	&:focus,
	&:active {
		color: ${({ theme }) => theme.text2};
		box-shadow: none;
		outline: none;
		text-decoration: none;
	}

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 6px;
		width: 10px;
		height: 10px;
		border-radius: 10px;
		background-color: ${({ theme }) => theme.success};
	}
`;

const HeaderDropdown = ({ items, title, ...props }) => {
	const { account, deactivate } = useActiveWeb3React();
	const theme = useContext(ThemeContext);
	const { t } = useTranslation();

	const logoutHandler = () => {
		if (account) {
			deactivate();
			props.history.push("/");
		}
	};

	return (
		<Wrapper>
			<Item>
				<Button className="btn btn-circle btn-light-primary">
					<UserIcon size={"20px"} />
				</Button>
				<SVG src={ArrowDown} style={{ color: theme.primary }} />
			</Item>
			<DropDown className={"header-dropdown"}>
				{Object.values(items).map((item, index) => {
					return (
						<DropDownItem to={item.path} key={`${title}-${index}`}>
							{t(`menu.${item.title}`)}
						</DropDownItem>
					);
				})}
				<DropDownButton onClick={logoutHandler}>{t("menu.disconnect")}</DropDownButton>
			</DropDown>
		</Wrapper>
	);
};

export default withRouter(HeaderDropdown);

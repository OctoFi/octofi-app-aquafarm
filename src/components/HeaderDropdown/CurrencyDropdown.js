import { useEffect } from "react";
import styled from "styled-components";
import { Button as BootstrapButton, Row, Col } from "react-bootstrap";

import { Link, withRouter } from "react-router-dom";
import Img from "../UI/Img";
import { rates } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../state/currency/actions";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	position: relative;
	padding: 14px 0;

	&:hover .header-dropdown {
		opacity: 1;
		visibility: visible;
		transform: rotateX(0deg) scale(1);
	}
`;

const Item = styled.div`
	display: flex;
	align-items: center;
`;

const Button = styled.button`
	margin-right: 0.75rem;
`;

const DropDown = styled.div`
	position: absolute;
	top: 100%;
	right: 0;
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 0.75rem;
	box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
	padding: 20px;
	width: auto;
	min-width: 260px;

	opacity: 0;
	visibility: hidden;
	transform-style: preserve-3d;
	transform: rotateX(-40deg) scale(0.8);
	transform-origin: top center;
	transition: 0.4s ease all;
	z-index: 99999;
`;

const DropDownItem = styled(Link)`
	display: flex;
	align-items: center;
	position: relative;
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
`;

const CurrencyLogo = styled(Img)`
	width: 24px;
	height: 24px;
	margin-right: 20px;
	border-radius: 24px;
	border: 1px solid #a890fe;
	min-width: 24px;
`;

const FlagButton = styled(BootstrapButton)`
	margin-right: 12px;
`;

const Title = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text2};
`;

const HeaderDropdown = ({ items, title, ...props }) => {
	const selectedCurrency = useSelector((state) => state.currency.selected);
	const { i18n } = useTranslation();
	const dispatch = useDispatch();

	const selectDestinationCurrency = (id) => {
		dispatch(actions.fetchCurrencies(id));
		i18n.changeLanguage(rates[id].lng);
	};

	useEffect(() => {
		dispatch(actions.fetchCurrencies(selectedCurrency));
	}, [selectedCurrency, dispatch]);

	return (
		<Wrapper>
			<Item>
				<FlagButton variant={"link"} className={"py-0 px-0"}>
					<Img src={require("../../assets/images/header/flag.svg").default} alt={""} />
				</FlagButton>
			</Item>
			<DropDown className={"header-dropdown"}>
				<Row>
					{Object.keys(rates).map((currency) => (
						<Col xs={6} className={"my-2"}>
							<DropDownItem
								onClick={selectDestinationCurrency.bind(this, currency)}
								key={`currency-${currency}`}
							>
								<CurrencyLogo src={rates[currency].image} alt={currency} />
								<Title>{currency}</Title>
							</DropDownItem>
						</Col>
					))}
				</Row>
			</DropDown>
		</Wrapper>
	);
};

export default withRouter(HeaderDropdown);

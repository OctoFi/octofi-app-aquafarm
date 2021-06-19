import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import { rates } from "../../constants";
import * as actions from "../../state/currency/actions";
import FlagIcon from "../../assets/images/flag.svg";
import { Wrapper, Item, IconButton, DropDown, DropDownItem, CurrencyLogo, Title2 } from "./styles";

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
				<IconButton variant={"link"} className={"py-0 px-0"}>
					<SVG src={FlagIcon} />
				</IconButton>
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
								<Title2>{currency}</Title2>
							</DropDownItem>
						</Col>
					))}
				</Row>
			</DropDown>
		</Wrapper>
	);
};

export default withRouter(HeaderDropdown);

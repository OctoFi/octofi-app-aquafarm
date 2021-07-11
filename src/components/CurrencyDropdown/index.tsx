import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { rates } from "../../constants";
import * as actions from "../../state/currency/actions";
import * as Styled from "./styleds";

const CurrencyDropdown = () => {
	// @ts-ignore
	const selectedCurrency = useSelector((state) => state.currency.selected);
	const { i18n } = useTranslation();
	const dispatch = useDispatch();

	const selectDestinationCurrency = (id: any) => {
		dispatch(actions.fetchCurrencies(id));
		i18n.changeLanguage(rates[id].lng);
	};

	useEffect(() => {
		dispatch(actions.fetchCurrencies(selectedCurrency));
	}, [selectedCurrency, dispatch]);

	return (
		<Styled.CurrencyWrapper>
			<Styled.Item>
				<Styled.IconButton variant={"link"} className={"p-0"}>
					<Styled.CurrencyLogo src={rates[selectedCurrency].image} alt={selectedCurrency} />
					<Styled.Title>{selectedCurrency}</Styled.Title>
				</Styled.IconButton>
			</Styled.Item>
			<Styled.DropDown className={"header-dropdown"}>
				<Row noGutters>
					{Object.keys(rates).map((currency) => (
						<Col xs={6}>
							<Styled.DropDownItem
								onClick={selectDestinationCurrency.bind(this, currency)}
								key={`currency-${currency}`}
								variant={"link"}
								className={currency === selectedCurrency ? "active" : ""}
							>
								<Styled.CurrencyLogo src={rates[currency].image} alt={currency} />
								<Styled.Title>{currency}</Styled.Title>
							</Styled.DropDownItem>
						</Col>
					))}
				</Row>
			</Styled.DropDown>
		</Styled.CurrencyWrapper>
	);
};

export default CurrencyDropdown;

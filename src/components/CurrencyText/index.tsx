import { useSelector } from "react-redux";
import styled from "styled-components";

import { rates as currencies } from "../../constants";
import { formatMoney } from "../../lib/helper";

const Floats = styled.span`
	color: ${({ theme }) => theme.text1};
	opacity: 0.25;
`;

const CurrencyText = (props: any) => {
	// @ts-ignore
	const { selected, currenciesRate }: { selected: any; currenciesRate: any } = useSelector((state) => state.currency);
	const value = props.children * (currenciesRate[selected] || 1);
	const formattedValue = formatMoney(value, value < 0.1 && value !== 0 ? 6 : 2);
	if (props.type === "grey-dark") {
		const splitedValue = formattedValue?.split(".");
		return (
			<>
				{currencies[selected].symbol + splitedValue?.[0]}
				<Floats>.{splitedValue?.[1]}</Floats>
			</>
		);
	}
	return <>{currencies[selected].symbol + formattedValue}</>;
};

export default CurrencyText;

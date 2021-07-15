import { useDispatch } from "react-redux";
import { changeGasPrice } from "../../state/currency/actions";
import * as Styled from "./styleds";

export type GasPricesProps = {
	prices: Array<any>;
	selected?: string;
};

const GasPrices = ({ prices, selected }: GasPricesProps) => {
	const dispatch = useDispatch();
	const onSelectPrice = (gas: string) => {
		dispatch(changeGasPrice(gas));
	};

	return (
		<Styled.GasRow>
			{prices.map((item) => {
				const [gas, value] = item;

				return (
					<Styled.GasOption key={gas}>
						<Styled.GasInput
							type="radio"
							id={`gas-price-${gas}`}
							name="gasPrice"
							value={gas}
							onChange={() => onSelectPrice(gas)}
							checked={selected === gas}
							className="sr-only"
						/>
						<Styled.GasLabel htmlFor={`gas-price-${gas}`}>
							<Styled.GasName>{gas}</Styled.GasName>
							<Styled.GasValue>{Number.parseInt(value)}</Styled.GasValue>
							<Styled.GasUnits>Gwei</Styled.GasUnits>
						</Styled.GasLabel>
					</Styled.GasOption>
				);
			})}
		</Styled.GasRow>
	);
};

export default GasPrices;

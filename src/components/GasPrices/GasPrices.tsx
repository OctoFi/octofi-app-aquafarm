import * as Styled from "./styleds";

export type GasPricesProps = {
	prices: Array<any>;
	selected?: string;
	onSelectPrice: (T: string) => void;
};

const GasPrices = ({ prices, selected, onSelectPrice }: GasPricesProps) => {
	return (
		<Styled.GasRow>
			{prices.map((item) => {
				const [name, value] = item;

				return (
					<Styled.GasOption key={name}>
						<Styled.GasInput
							type="radio"
							id={`gas-price-${name}`}
							name="gasPrice"
							value={name}
							onChange={() => onSelectPrice(name)}
							checked={selected === name}
							className="sr-only"
						/>
						<Styled.GasLabel htmlFor={`gas-price-${name}`}>
							<span>{name}</span>
							<Styled.GasValue>{Number.parseInt(value)}</Styled.GasValue>
							<span>Gwei</span>
						</Styled.GasLabel>
					</Styled.GasOption>
				);
			})}
		</Styled.GasRow>
	);
};

export default GasPrices;

export type NumberDisplayProps = {
	value: number | string;
	hide?: boolean;
	currency?: boolean;
};

const NumberDisplay = ({ value, hide = false, currency = false }: NumberDisplayProps) => {
	const options = currency ? { style: "currency", currency: "USD" } : {};
	return <div>{value.toLocaleString(navigator.language, options)}</div>;
};

export default NumberDisplay;

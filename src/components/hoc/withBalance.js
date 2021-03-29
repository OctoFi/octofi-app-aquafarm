import { useSpotBalances } from "../../hooks/useTokenToBalance";

const withBalance = (Component) => {
	return (props) => {
		const balances = useSpotBalances();
		return <Component {...props} {...balances} />;
	};
};

export default withBalance;

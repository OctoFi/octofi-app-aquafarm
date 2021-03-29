import { useActiveWeb3React } from "../../hooks";
import { useWalletModalToggle } from "../../state/application/hooks";

const withWeb3Account = (Component: any) => {
	return (props: any) => {
		const context = useActiveWeb3React();
		const toggleWalletModal = useWalletModalToggle();
		return <Component web3={context} toggleWalletModal={toggleWalletModal} {...props} />;
	};
};

export default withWeb3Account;

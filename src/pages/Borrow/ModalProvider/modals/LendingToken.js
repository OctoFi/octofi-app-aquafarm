import { ConfirmationPendingContent } from "../../../../components/TransactionConfirmationModal";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { useActiveWeb3React } from "../../../../hooks";
import { tokenAmountInUnits, tokenSymbolToDisplayString } from "../../../../utils/spot/tokens";
import { getGasInfo, getStepsModalCurrentStep } from "../../../../state/selectors";
import { lendingDefiToken, unLendingDefiToken } from "../../../../state/defi/actions";

const LendingToken = (props) => {
	const [loading, setLoading] = useState(false);
	const { account } = useActiveWeb3React();

	const { step, onSubmitLendingToken, onSubmitUnLendingToken } = props;
	const { amount, token, isEth, defiToken, isLending } = step;

	const coinSymbol = isEth ? tokenSymbolToDisplayString("ETH") : tokenSymbolToDisplayString(token.symbol);
	const decimals = isEth ? 18 : step.token.decimals;
	const amountOfTokenString = `${tokenAmountInUnits(
		step.amount,
		decimals,
		step.token.displayDecimals
	).toString()} ${coinSymbol}`;

	const web3 = props.web3;

	const Lending = async () => {
		try {
			const txHash = isLending
				? await onSubmitLendingToken(token, defiToken, amount, isEth, account)
				: await onSubmitUnLendingToken(token, defiToken, amount, isEth, account);
			setLoading(true);
			const tx = await web3.awaitTransactionSuccessAsync(txHash);
			if (tx) {
				setLoading(false);
				props.onDone(txHash);
			}
		} catch (err) {
			setLoading(false);
			props.onDismiss();
		}
	};

	useEffect(() => {
		Lending();
	}, [step]);

	return (
		<ConfirmationPendingContent
			onDismiss={loading ? () => null : props.onDismiss}
			pendingText={
				loading
					? `Pending Transaction...`
					: `Confirm on ${account} to ${isLending ? "deposit" : "withdraw"} ${amountOfTokenString}.`
			}
		/>
	);
};

const mapStateToProps = (state) => {
	return {
		step: getStepsModalCurrentStep(state),
		gasInfo: getGasInfo(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSubmitLendingToken: (token, defiToken, amount, isEth, account) =>
			dispatch(lendingDefiToken(token, defiToken, amount, isEth, account)),
		onSubmitUnLendingToken: (token, defiToken, amount, isEth, account) =>
			dispatch(unLendingDefiToken(token, defiToken, amount, isEth, account)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(LendingToken);

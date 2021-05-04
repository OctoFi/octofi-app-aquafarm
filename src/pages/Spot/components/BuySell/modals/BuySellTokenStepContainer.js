import { ConfirmationPendingContent } from "../../../../../components/TransactionConfirmationModal";
import React, { useEffect } from "react";
import { connect } from "react-redux";

import { useActiveWeb3React } from "../../../../../hooks";
import { getCurrencyPair, getQuoteToken, getStepsModalCurrentStep } from "../../../../../state/selectors";
import { getOrderbookAndUserOrders, submitMarketOrder } from "../../../../../state/relayer/actions";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));

const BuySellTokenMatchingStepContainer = (props) => {
	const { account, library } = useActiveWeb3React();
	const { step, onSubmitMarketOrder } = props;
	const { amount, side, context } = step;

	const submitOrder = async () => {
		try {
			if (context === "order") {
				const { txHash, amountInReturn } = await onSubmitMarketOrder(
					amount,
					side,
					account,
					web3.currentProvider || window.ethereum
				);
				props.onDone(txHash);
				props.refreshOrders();
			}
		} catch (e) {
			props.onDismiss();
		}
	};

	useEffect(() => {
		submitOrder();
	}, [step, account]);

	return <ConfirmationPendingContent onDismiss={props.onDismiss} pendingText={"Waiting for confirmation"} />;
};

const mapStateToProps = (state) => {
	return {
		step: getStepsModalCurrentStep(state),
		currencyPair: getCurrencyPair(state),
		quoteToken: getQuoteToken(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSubmitMarketOrder: (amount, side, account, library) =>
			dispatch(submitMarketOrder(amount, side, account, library)),
		refreshOrders: (account, library) => dispatch(getOrderbookAndUserOrders(account, library)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(BuySellTokenMatchingStepContainer);

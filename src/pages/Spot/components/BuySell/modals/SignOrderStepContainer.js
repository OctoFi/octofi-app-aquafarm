import { ConfirmationPendingContent } from "../../../../../components/TransactionConfirmationModal";
import React, { useEffect } from "react";
import { connect } from "react-redux";

import { useActiveWeb3React } from "../../../../../hooks";
import { createSignedOrder } from "../../../../../state/spotUI/actions";
import { getStepsModalCurrentStep } from "../../../../../state/selectors";
import { submitLimitOrder } from "../../../../../state/relayer/actions";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));

const SignOrderStepContainer = (props) => {
	const { account, library } = useActiveWeb3React();
	const { step } = props;
	const { amount, price, side } = step;

	const submitOrder = async () => {
		try {
			const signedOrder = await props.createSignedOrder(
				amount,
				price,
				side,
				account,
				web3.currentProvider || window.ethereum,
				library
			);
			await props.submitLimitOrder(signedOrder, amount, side);

			props.onDone();
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
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		submitLimitOrder: (signedOrder, amount, side, account, library) =>
			dispatch(submitLimitOrder(signedOrder, amount, side, account, library)),
		createSignedOrder: (amount, price, side, account, web3, library) =>
			dispatch(createSignedOrder(amount, price, side, account, web3, library)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(SignOrderStepContainer);

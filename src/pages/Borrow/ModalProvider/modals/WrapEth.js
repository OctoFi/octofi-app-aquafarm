import { ConfirmationPendingContent } from "../../../../components/TransactionConfirmationModal";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getStepsModalCurrentStep } from "../../../../state/selectors";
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from "../../../../constants";
import { useActiveWeb3React } from "../../../../hooks";
import { getContractWrappers } from "../../../../utils/spot/contractWrapper";
import { ERC20TokenContract } from "@0x/contract-wrappers";
import { stepsModalAdvanceStep, updateWethBalance } from "../../../../state/spotUI/actions";
import withBalance from "../../../../components/hoc/withBalance";
import {
	INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT,
	UNEXPECTED_ERROR,
	USER_DENIED_TRANSACTION_SIGNATURE_ERR,
} from "../../../../lib/exceptions/common";
import { tokenAmountInUnits } from "../../../../utils/spot/tokens";
import { ConvertBalanceMustNotBeEqualException } from "../../../../lib/exceptions/convertBalance";

const WrapEth = (props) => {
	const [wrapping, setWrapping] = useState(false);
	const { account } = useActiveWeb3React();
	const currentStep = useSelector(getStepsModalCurrentStep);
	const { wethBalance } = props;
	const { currentWethBalance, newWethBalance } = currentStep;
	const web3 = props.web3;
	const dispatch = useDispatch();

	const amount = newWethBalance.minus(currentWethBalance);
	const isEthToWeth = amount.isGreaterThan(0);
	const convertingFrom = isEthToWeth ? "ETH" : "wETH";

	const wrapEthereum = async () => {
		try {
			const convertTxHash = await dispatch(
				updateWethBalance(wethBalance, newWethBalance, account, web3.getProvider())
			);
			setWrapping(true);
			const tx = await web3.awaitTransactionSuccessAsync(convertTxHash);

			if (tx) {
				setWrapping(false);
				dispatch(stepsModalAdvanceStep());
			}
		} catch (err) {
			setWrapping(false);
			props.onDismiss();
		}
	};

	useEffect(() => {
		wrapEthereum();
	}, [currentStep]);

	return (
		<ConfirmationPendingContent
			onDismiss={wrapping ? () => null : props.onDismiss}
			pendingText={wrapping ? "Wrapping..." : `Convert ${convertingFrom}`}
		/>
	);
};

export default withBalance(WrapEth);

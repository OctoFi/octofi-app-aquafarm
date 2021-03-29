import { ConfirmationPendingContent } from "../../../../components/TransactionConfirmationModal";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getStepsModalCurrentStep } from "../../../../state/selectors";
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from "../../../../constants";
import { useActiveWeb3React } from "../../../../hooks";
import { getContractWrappers } from "../../../../utils/spot/contractWrapper";
import { ERC20TokenContract } from "@0x/contract-wrappers";
import { stepsModalAdvanceStep } from "../../../../state/spotUI/actions";

const UnlockToken = (props) => {
	const [unlocking, setUnlocking] = useState(false);
	const { account, library } = useActiveWeb3React();
	const currentStep = useSelector(getStepsModalCurrentStep);
	const { address, token } = currentStep;
	const web3 = props.web3;
	const dispatch = useDispatch();

	const unlockToken = async () => {
		try {
			const contractWrappers = await getContractWrappers(web3.getProvider());
			const approveAddress = address ? address : contractWrappers.contractAddresses.erc20Proxy;

			const erc20Token = new ERC20TokenContract(token.address, contractWrappers.getProvider());
			const amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS;

			const tx = await erc20Token.approve(approveAddress, amount).sendTransactionAsync({
				from: account,
			});
			setUnlocking(true);
			await web3.awaitTransactionSuccessAsync(tx);

			if (tx) {
				setUnlocking(false);
				dispatch(stepsModalAdvanceStep());
			}
		} catch (e) {
			setUnlocking(false);
			props.onDismiss();
		}
	};

	useEffect(() => {
		unlockToken();
	}, [currentStep]);

	return (
		<ConfirmationPendingContent
			onDismiss={unlocking ? () => null : props.onDismiss}
			pendingText={unlocking ? "Unlocking" : "Waiting for confirmation"}
		/>
	);
};

export default UnlockToken;

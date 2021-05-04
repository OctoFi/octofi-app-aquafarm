import { Modal } from "../../../../components/Modal/bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { getStepsModalCurrentStep } from "../../../../state/selectors";
import { setStepsModalCurrentStep } from "../../../../state/spotUI/actions";
import { CHAIN_ID, StepKind } from "../../../../constants";

import UnlockToken from "../../../Borrow/ModalProvider/modals/UnlockToken";
import SignOrderStepContainer from "./modals/SignOrderStepContainer";
import BuySellTokenMatchingStepContainer from "./modals/BuySellTokenMatchingStepContainer";
import BuySellTokenStepContainer from "./modals/BuySellTokenStepContainer";
import React, { useState } from "react";
import { TransactionSubmittedContent } from "../../../../components/TransactionConfirmationModal";

const ModalProvider = (props) => {
	const [submitted, setSubmitted] = useState(false);
	const [txHash, setTxHash] = useState(null);
	const currentStep = useSelector(getStepsModalCurrentStep);
	const dispatch = useDispatch();
	const isOpen = currentStep !== null;

	const hideModal = () => {
		setSubmitted(false);
		setTxHash(null);
		dispatch(setStepsModalCurrentStep(null));
	};

	const onDone = (tx) => {
		setSubmitted(true);
		setTxHash(tx);
	};

	return (
		<>
			{props.children}
			<Modal show={isOpen} centered onHide={hideModal}>
				<Modal.Body className={"px-0 py-0"}>
					{!submitted ? (
						<>
							{currentStep && currentStep.kind === StepKind.ToggleTokenLock && (
								<UnlockToken onDismiss={hideModal} />
							)}

							{currentStep && currentStep.kind === StepKind.BuySellLimit && (
								<SignOrderStepContainer onDismiss={hideModal} onDone={onDone} />
							)}
							{currentStep && currentStep.kind === StepKind.BuySellLimitMatching && (
								<BuySellTokenMatchingStepContainer onDismiss={hideModal} onDone={onDone} />
							)}
							{currentStep && currentStep.kind === StepKind.BuySellMarket && (
								<BuySellTokenStepContainer onDismiss={hideModal} onDone={onDone} />
							)}
						</>
					) : (
						<TransactionSubmittedContent chainId={CHAIN_ID} hash={txHash} onDismiss={hideModal} />
					)}
				</Modal.Body>
			</Modal>
		</>
	);
};

export default ModalProvider;

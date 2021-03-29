import { Modal } from "../../../components/Modal/bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import { Web3Wrapper } from "@0x/web3-wrapper";

import { getStepsModalCurrentStep } from "../../../state/selectors";
import { setStepsModalCurrentStep } from "../../../state/spotUI/actions";
import { CHAIN_ID, StepKind } from "../../../constants";

import UnlockToken from "./modals/UnlockToken";
import React, { useEffect, useState } from "react";
import { TransactionSubmittedContent } from "../../../components/TransactionConfirmationModal";
import WrapEth from "./modals/WrapEth";
import LendingToken from "./modals/LendingToken";
import BorrowToken from "./modals/BorrowToken";

let web3;
let web3Wrapper;

const ModalProvider = (props) => {
	const [submitted, setSubmitted] = useState(false);
	const [txHash, setTxHash] = useState(null);
	const currentStep = useSelector(getStepsModalCurrentStep);
	const dispatch = useDispatch();
	const isOpen = currentStep !== null;

	useEffect(() => {
		web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		if (web3.currentProvider) {
			web3Wrapper = new Web3Wrapper(web3.currentProvider);
		}
	}, []);

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
								<UnlockToken onDismiss={hideModal} web3={web3Wrapper} />
							)}
							{currentStep && currentStep.kind === StepKind.WrapEth && (
								<WrapEth onDismiss={hideModal} web3={web3Wrapper} />
							)}
							{currentStep && currentStep.kind === StepKind.LendingToken && (
								<LendingToken onDismiss={hideModal} onDone={onDone} web3={web3Wrapper} />
							)}
							{currentStep && currentStep.kind === StepKind.UnLendingToken && (
								<LendingToken onDismiss={hideModal} onDone={onDone} web3={web3Wrapper} />
							)}
							{currentStep && currentStep.kind === StepKind.RepayToken && (
								<BorrowToken onDismiss={hideModal} onDone={onDone} web3={web3Wrapper} />
							)}
							{currentStep && currentStep.kind === StepKind.BorrowToken && (
								<BorrowToken onDismiss={hideModal} onDone={onDone} web3={web3Wrapper} />
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

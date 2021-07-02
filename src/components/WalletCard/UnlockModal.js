import { ConfirmationPendingContent, TransactionSubmittedContent } from "../TransactionConfirmationModal";
import React from "react";
import { Modal } from "../Modal/bootstrap";
import { CHAIN_ID } from "../../constants";

const UnlockModal = (props) => {
	const { unlocking, show, onDismiss, done } = props;
	return (
		<Modal show={show} onHide={onDismiss} centered>
			<Modal.Body className={"px-0 py-0"}>
				{!done ? (
					<ConfirmationPendingContent
						onDismiss={unlocking ? () => null : onDismiss}
						pendingText={unlocking ? "Unlocking" : "Waiting for confirmation"}
					/>
				) : (
					<TransactionSubmittedContent chainId={CHAIN_ID} hash={undefined} onDismiss={onDismiss} />
				)}
			</Modal.Body>
		</Modal>
	);
};

export default UnlockModal;

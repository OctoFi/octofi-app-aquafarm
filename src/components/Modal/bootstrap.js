import { Modal as BSModal } from "react-bootstrap";
import styled from "styled-components";

export const Modal = styled(BSModal)`
	& .modal-content {
		background-color: ${({ theme }) => theme.modalBG} !important;
		color: ${({ theme }) => theme.text1} !important;
	}
	& .modal-body,
	& .modal-header,
	& .modal-footer {
		color: ${({ theme }) => theme.text1} !important;
	}
`;

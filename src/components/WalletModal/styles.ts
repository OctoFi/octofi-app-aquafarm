import { Link } from "react-router-dom";
import styled from "styled-components";
import { Modal } from "../Modal/bootstrap";

export const Wrapper = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	margin: 0;
	padding: 0;
	width: 100%;
`;

export const ContentWrapper = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	padding-bottom: 2rem;
	border-bottom-left-radius: 0.42rem;
	border-bottom-right-radius: 0.42rem;
`;

export const LedgerContentWrapper = styled(ContentWrapper)`
	@media (max-width: 1199px) {
		padding: 24px 20px 112px;
	}
`;

export const UpperSection = styled.div`
	position: relative;

	h5 {
		margin: 0;
		margin-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: 400;
	}

	h5:last-child {
		margin-bottom: 0px;
	}

	h4 {
		margin-top: 0;
		font-weight: 500;
	}
`;

export const OptionGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
	
	@media (max-width: 991px) {
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
	
	@media (max-width: 576px) {
		grid-template-columns: 1fr 1fr 1fr;
	}
	
	@media (max-width: 320px) {
		grid-template-columns: 1fr 1fr;
	}
`;

export const ModalBody = styled(Modal.Body)`
  padding: 20px 36px;
`;

export const ModalHeader = styled(Modal.Header)`
	padding-left: 36px;
	padding-right: 36px;
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 20px;
`;

export const SectionTitle = styled.h3`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
	line-height: 21px;
	margin: 0 0 0 8px;
`;

export const SectionNumber = styled.div`
	width: 24px;
	height: 24px;
	font-weight: 500;
	font-size: 1rem;
	line-height: 19px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 24px;
	background-color: ${({ theme }) => theme.primaryLight};
	color: ${({ theme }) => theme.primary};
`;

export const AlertContainer = styled.div`
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 4px 4px 4px 16px;
  background-color: ${({ theme }) => theme.dangerLight};
`;

export const AlertText = styled.span`
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.danger};
  line-height: 21px;
  padding-right: 1rem;
`;

export const Title = styled.span`
    font-weight: 500;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text3};
    margin-bottom: 8px;
    display: block;
`;

export const SeeAllButton = styled(Link)`
    text-decoration: none;
    font-weight: 500;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.primary};
    display: block;
    text-align: center;
`;

import { Form } from "react-bootstrap";
import styled from "styled-components";

export const GasRow = styled(Form)`
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	gap: 0.5rem;
`;

export const GasOption = styled(Form.Check)`
	padding-left: 0;
	min-width: calc(25% - 0.5rem);
	width: calc(25% - 0.5rem);
`;

export const GasInput = styled(Form.Check.Input)<{ checked?: boolean }>`
	+ label {
		background-color: ${({ checked, theme }) => (checked ? theme.primary : theme.primaryLight)};
		color: ${({ checked, theme }) => (checked ? theme.text1 : theme.text3)};
	}
`;

export const GasLabel = styled(Form.Check.Label)`
	border: 1px solid ${({ theme }) => theme.primaryLight};
	border-radius: 12px;
	cursor: pointer;
	font-size: 0.625rem;
	text-transform: capitalize;
	padding: 0.5rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;

	&:hover {
		border-color: ${({ theme }) => theme.primary};
	}
`;

export const GasValue = styled.span`
	font-size: 1.25rem;
	font-weight: 600;
`;

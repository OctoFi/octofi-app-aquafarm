import { InputGroup as Group, Form } from "react-bootstrap";
import styled from "styled-components";

export const InputGroupPrepend = styled(Group.Prepend)``;

export const InputGroupAppend = styled(Group.Append)``;

export const InputGroupText = styled(Group.Text)`
	background-color: ${({ theme }) => theme.modalBG} !important;
	border-color: ${({ theme }) => theme.text4} !important;
	color: ${({ theme }) => theme.text1};
  
  ${InputGroupPrepend} & {
    padding-left: 2rem;
    padding-right: 0.75rem;
  } 
  
  ${InputGroupAppend} & {
    padding-right: 2rem;
    padding-left: 0.75rem;
  } 
`;

export const InputGroupFormControl = styled(Form.Control)`
	border-color: ${({ theme }) => theme.text4} !important;
	background-color: ${({ theme }) => theme.modalBG} !important;
	color: ${({ theme }) => theme.text1} !important;

	::placeholder {
		color: ${({ theme }) => theme.text3};
	}
`;
export const FormControl = styled(Form.Control)`
	border-color: ${({ theme }) => theme.text3} !important;
	background-color: ${({ theme }) => theme.bg1} !important;
	color: ${({ theme }) => theme.text1} !important;

	::placeholder {
		color: ${({ theme }) => theme.text3};
	}
`;

export const InputGroup = styled(Group)`
	& ${InputGroupText} {
		background-color: ${({ theme, bg }) => (bg === "darker" ? theme.bg1 : theme.modalBG)} !important;
	}

	& ${InputGroupFormControl} {
		background-color: ${({ theme, bg }) => (bg === "darker" ? theme.bg1 : theme.modalBG)} !important;
	}
`;

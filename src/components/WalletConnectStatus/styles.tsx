import styled from "styled-components";

export const AccountState = styled.div<{ type?: string }>`
	color: ${({ theme, type }) => (type === "success" ? theme.success : theme.danger)};
	display: flex;
	align-items: center;
	justify-content: ${({ type }) => (type === "success" ? "flex-start" : "center")};
	padding: ${({ type }) => (type === "success" ? "14px 20px" : "24px 20px")};
	border-radius: 18px;
`;

export const AccountStateContent = styled.div`
	margin-left: 20px;
`;

export const AccountStateTitle = styled.h3`
	color: currentColor;
	font-size: 1rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
`;

export const AccountStateDesc = styled.span`
	color: rgba(74, 200, 170, 0.5);
	font-size: 0.875rem;
	font-weight: 500;

	strong {
		color: ${({ theme }) => theme.success};
		font-weight: 500;
	}
`;

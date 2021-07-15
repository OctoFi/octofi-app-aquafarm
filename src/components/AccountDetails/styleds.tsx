import styled from "styled-components";
import { Jazzicon } from "@ukstv/jazzicon-react";

export const UpperSection = styled.div`
	position: relative;
`;

export const AccountGroupingRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	justify-content: space-between;
	color: ${({ theme }) => theme.text1};
`;

export const AccountSection = styled.div`
	position: relative;
	display: grid;
	gap: 1rem;
`;

export const AccountControl = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	gap: 1rem;
	width: 100%;
	
	@media (min-width: 768px) {
		${({ theme }) => theme.flexRowNoWrap};
		align-items: center;
	}
`;

export const AddressObject = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
`;

export const ModifiedJazzicon = styled(Jazzicon)`
	border-radius: 50%;
	width: 1.5rem;
	height: 1.5rem;
`;

export const WalletName = styled.div`
	width: initial;
	font-size: 1rem;
	font-weight: 600;
	color: ${({ theme }) => theme.text3};
`;

export const WalletAddress = styled.p`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 500;
	margin: 0;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ChangeAccountContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-top: 1.5rem;
`;

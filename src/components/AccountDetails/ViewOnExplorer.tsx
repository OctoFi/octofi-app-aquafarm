import { ExternalLink } from "react-feather";
import { getExplorerLink } from "../../utils";
import styled from "styled-components";

const ExplorerLink = styled.a`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	gap: 0.5rem;
	color: ${({ theme }) => theme.text3};
	text-decoration: none;
	font-size: 1rem;
	font-weight: 500;
	line-height: 1.5;
	padding: 0;

	&:hover,
	&:active,
	&:focus {
		text-decoration: underline;
		color: ${({ theme }) => theme.text3};
		outline: none;
	}
`;

export type ViewOnExplorerProps = {
	address: string;
	chainId?: number;
};

const ViewOnExplorer = ({ address, chainId = 1 }: ViewOnExplorerProps) => {
	return (
		<ExplorerLink href={getExplorerLink(chainId, address, "address")} target="_blank" rel="noreferrer noopener">
			<ExternalLink size={20} />
			<span>View on explorer</span>
		</ExplorerLink>
	);
};

export default ViewOnExplorer;

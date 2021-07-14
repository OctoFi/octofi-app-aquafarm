import { useTranslation } from "react-i18next";
import moment from "moment";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import { ModifiedJazzicon } from "../../components/VoteItem";
import VoteLogo from "../../components/VoteLogo";
import * as Styled from "./styleds";

export type VoteInformationProps = {
	proposal: any;
	space: any;
	id: any;
};

export default function VoteInformation({ proposal, space, id }: VoteInformationProps) {
	const { t } = useTranslation();

	return (
		<Card
			header={
				<div className="d-flex flex-column justify-content-around">
					<Styled.BoxHeader>
						<Styled.BoxTitle>{t("information")}</Styled.BoxTitle>
					</Styled.BoxHeader>
				</div>
			}
		>
			<div className="d-flex flex-column justify-content-start">
				<ListItem title={t("importList.tokens")}>
					<div className="d-flex align-items-center justify-content-end">
						{space.strategies.map((s: any, index: number) => {
							return (
								<div
									key={`space-strategy-${index}`}
									className="d-flex align-items-center"
									style={{ marginLeft: index !== 0 ? "21px" : "0px" }}
								>
									<VoteLogo id={id} symbolIndex={index} size={30} />
									<Styled.TokenValue>{s.params.symbol}</Styled.TokenValue>
								</div>
							);
						})}
					</div>
				</ListItem>

				<ListItem title={t("author")}>
					<div className="d-flex align-items-center">
						<ModifiedJazzicon address={proposal.address} />
						<Styled.AuthorLink
							href={`https://etherscan.io/address/${proposal.address}`}
							target={"_blank"}
							rel={"noopener noreferrer"}
						>
							{proposal.address.slice(0, 6)}...
							{proposal.address.slice(-4)}
						</Styled.AuthorLink>
					</div>
				</ListItem>

				<ListItem title={"IPFS"}>
					<Styled.AuthorLink
						href={`https://ipfs.io/ipfs/${proposal.authorIpfsHash}`}
						target={"_blank"}
						rel={"noopener noreferrer"}
					>
						#{proposal.authorIpfsHash.slice(0, 7)}
					</Styled.AuthorLink>
				</ListItem>
				<ListItem title={t("startDate")}>
					<Styled.InfoText fontWeight={400}>
						{proposal && moment(proposal.msg.payload.start * 1e3).format("YYYY/MM/DD hh:mm")}
					</Styled.InfoText>
				</ListItem>
				<ListItem title={t("endDate")}>
					<Styled.InfoText fontWeight={400}>
						{proposal && moment(proposal.msg.payload.end * 1e3).format("YYYY/MM/DD hh:mm")}
					</Styled.InfoText>
				</ListItem>
				<ListItem title={t("token")}>
					<Styled.InfoText>{proposal.address.slice(0, 6)}</Styled.InfoText>
				</ListItem>
				<ListItem title={"Snapshot"}>
					<Styled.AuthorLink
						href={`https://etherscan.io/block/${proposal.msg.payload.snapshot}`}
						target={"_blank"}
						rel={"noopener noreferrer"}
					>
						{proposal.msg.payload.snapshot}
					</Styled.AuthorLink>
				</ListItem>
			</div>
		</Card>
	);
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import Loading from "../../components/Loading";
import VoteItem from "../../components/VoteItem";
import * as Styled from "./styleds";

export type ProposalVotesProps = {
	votes: Array<any>;
	result: any;
	proposal: any;
	space: any;
};

export default function ProposalVotes({ votes, result, proposal, space }: ProposalVotesProps) {
	const { t } = useTranslation();
	const [showMore, setShowMore] = useState<boolean>(false);

	const onShowMore = () => setShowMore(true);

	return (
		<Styled.CustomCard
			header={
				<div className="d-flex flex-column justify-content-around">
					<Styled.BoxHeader>
						<Styled.BoxTitle>{t("governance.votes")}</Styled.BoxTitle>
						{votes && (
							<span
								className={`label label-light-primary label-lg font-weight-medium d-flex label-inline py-3 ml-3`}
							>
								{Object.keys(votes).length}
							</span>
						)}
					</Styled.BoxHeader>
				</div>
			}
		>
			<Styled.CustomTable>
				<Styled.Thead style={{ maxHeight: 1, opacity: 0, visibility: "hidden" }}>
					<tr>
						<td>User</td>
						<td>Vote</td>
						<td>Power</td>
					</tr>
				</Styled.Thead>
				<tbody>
					{result
						? showMore || (result.hasOwnProperty("votes") && Object.keys(result.votes || {}).length < 10)
							? Object.values(result.votes).map((vote: any, index: number) => {
									return (
										<VoteItem
											key={index}
											address={vote?.address}
											vote={proposal?.msg?.payload?.choices[vote.msg.payload.choice - 1]}
											score={vote?.balance}
											symbol={space?.symbol}
										/>
									);
							  })
							: result.hasOwnProperty("votes") &&
							  Object.values(result.votes)
									.slice(0, 10)
									.map((vote: any, index: number) => {
										return (
											<VoteItem
												key={index}
												address={vote?.address}
												vote={proposal?.msg?.payload?.choices[vote.msg.payload.choice - 1]}
												score={vote?.balance}
												symbol={space?.symbol}
											/>
										);
									})
						: null}
				</tbody>
			</Styled.CustomTable>
			{votes ? (
				<>
					{!showMore && Object.keys(votes || {}).length > 10 ? (
						<Styled.ShowMoreWrap className="py-4 text-center">
							<Button variant={"primary"} onClick={onShowMore}>
								{t("showMore")}
							</Button>
						</Styled.ShowMoreWrap>
					) : null}
				</>
			) : (
				<div className="d-flex align-items-center justify-content-center py-5 w-100 my-4">
					<Loading color={"primary"} width={40} height={40} active id={"votes-loading"} />
				</div>
			)}
		</Styled.CustomCard>
	);
}

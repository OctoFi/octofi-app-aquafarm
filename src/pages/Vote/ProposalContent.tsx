import { useMemo } from "react";
import { Remarkable } from "remarkable";
import dompurify from "dompurify";
import Card from "../../components/Card";
import * as Styled from "./styleds";

const md = new Remarkable();

export type ProposalContentProps = {
	proposal: any;
	status: any;
};

export default function ProposalContent({ proposal, status }: ProposalContentProps) {
	const voteBody = useMemo(() => {
		return dompurify.sanitize(proposal?.msg?.payload?.body);
	}, [proposal?.msg?.payload?.body]);

	return (
		<Card
			header={
				<div className="d-flex flex-column justify-content-around">
					<Styled.BoxHeader>
						<Styled.BoxTitle>{proposal.msg.payload.name}</Styled.BoxTitle>
						{status && (
							<span
								className={`label ${status.className} label-lg font-weight-medium d-flex label-inline py-3 ml-3`}
							>
								{status.title}
							</span>
						)}
					</Styled.BoxHeader>
				</div>
			}
		>
			<Styled.VoteContent
				dangerouslySetInnerHTML={{
					__html: md.render(voteBody),
				}}
			/>
		</Card>
	);
}

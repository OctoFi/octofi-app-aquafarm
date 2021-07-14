import { useTranslation } from "react-i18next";
import { shorten } from "../../state/governance/hooks";
import { _numeral } from "../../lib/utils";
import Card from "../../components/Card";
import * as Styled from "./styleds";

export type VoteResultsProps = {
	result: VoteResult;
	choices: Array<any>;
	symbol: string;
};

export type VoteResult = {
	totalBalances: any;
	totalVotesBalances: any;
};

export default function VoteResults({ result, choices, symbol }: VoteResultsProps) {
	const { t } = useTranslation();

	return (
		<Card
			header={
				<div className="d-flex flex-column justify-content-around">
					<Styled.BoxHeader>
						<Styled.BoxTitle>{t("results")}</Styled.BoxTitle>
					</Styled.BoxHeader>
				</div>
			}
		>
			<div className="d-flex flex-column">
				{choices.map((choice, i) => {
					const progress = !result.totalVotesBalances
						? 0
						: (100 / result.totalVotesBalances) * result.totalBalances?.[i];

					return (
						<Styled.ResultRow key={`results-row-${i}`}>
							<div className="d-flex align-items-center justify-content-between mb-2">
								<Styled.ResultTitle>{shorten(choice, "choice")}</Styled.ResultTitle>

								<Styled.ResultTitle>
									{_numeral(result.totalBalances?.[i])}
									{shorten(symbol, "symbol")}
								</Styled.ResultTitle>

								<Styled.ResultTitle>
									{!result.totalVotesBalances ? 0 : `${progress.toFixed(2)}%`}
								</Styled.ResultTitle>
							</div>
							<Styled.ResultProgress className={`progress progress-xs w-100`}>
								{/* @ts-ignore */}
								<Styled.ResultProgressBar
									role="progressbar"
									aria-valuenow="50"
									aria-valuemin="0"
									aria-valuemax="100"
									style={{
										width: `${progress}%`,
									}}
								/>
							</Styled.ResultProgress>
						</Styled.ResultRow>
					);
				})}
			</div>
		</Card>
	);
}

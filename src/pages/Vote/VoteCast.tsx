import { useTranslation } from "react-i18next";
import { Button } from 'react-bootstrap';
import { useWeb3React } from "@web3-react/core";
import Card from "../../components/Card";
import * as Styled from "./styleds";

export type VoteCastProps = {
	proposal: any;
	selected: any;
	onSelectOption: (T: number) => void;
	onVote: () => void;
};

export default function VoteCast({ proposal, selected, onSelectOption, onVote }: VoteCastProps) {
	const { t } = useTranslation();
	const { account } = useWeb3React();

	return (
		<Card
			header={
				<div className="d-flex flex-column justify-content-around">
					<Styled.BoxHeader>
						<Styled.BoxTitle>{t("governance.castVote")}</Styled.BoxTitle>
					</Styled.BoxHeader>
				</div>
			}
		>
			<div className="d-flex flex-column">
				{proposal.msg?.payload?.choices?.map((option: any, index: number) => {
					return (
						<button
							key={index}
							className={`btn ${
								index === selected - 1 ? `btn-secondary-light` : `btn-light-secondary-light`
							} mb-2 btn-block py-3`}
							onClick={() => onSelectOption(index + 1)}
						>
							{option}
						</button>
					);
				})}
				<Button
					className="py-3 mt-3 align-self-center"
					disabled={!selected}
					style={{ width: 200 }}
					onClick={onVote}
				>
					{account ? t("governance.vote") : t("wallet.connect")}
				</Button>
			</div>
		</Card>
	);
}

import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import * as Styled from "./styleds";

export type ProgressPriceCheckProps = {
	current: number;
	total: number;
};

const ProgressPriceCheck = ({ current, total }: ProgressPriceCheckProps) => {
	const { t } = useTranslation();
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress((current / total) * 100);
	}, [current, total]);

	return (
		<div className="d-flex flex-column align-items-stretch justify-content-center align-self-stretch">
			<Styled.RateText fontWeight={400} fontSize={isMobile ? 12 : 16} className="mb-3">
				{t("instantSwap.exchangeSearch", {
					current: current,
					total: total,
				})}
			</Styled.RateText>

			<Styled.ProgressContainer>
				<ProgressBar
					now={progress}
					variant={progress === 100 ? "success" : "primary"}
					label={`${progress}%`}
					srOnly
				/>
			</Styled.ProgressContainer>
		</div>
	);
};

export default ProgressPriceCheck;

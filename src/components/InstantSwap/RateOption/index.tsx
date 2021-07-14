import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { toAbsoluteUrl } from "../../../lib/helper";
import { DEXesImages, DEXesName } from "../../../constants";
import * as Styled from "./styleds";

export type RateOptionProps = {
	item: any;
	onSelectRate: (T: any) => void;
	rate?: any;
	pair: any;
	index?: any;
};

const RateOption = ({ item, onSelectRate, rate, pair, index }: RateOptionProps) => {
	const { t } = useTranslation();
	// @ts-ignore
	const dexImage = DEXesImages[item.platform];
	// @ts-ignore
	const dexName = DEXesName[item.platform];

	return (
		<Styled.PlatformCard
			selected={item.platform === rate.platform}
			key={`show-all-${item.platform}`}
			onClick={() => onSelectRate(item)}
			className="d-flex align-items-center justify-content-between"
		>
			<div className="d-flex align-items-center">
				<Styled.Logo src={toAbsoluteUrl(`/media/dex/${dexImage}`)} size={30} alt={item.platform} />
				<Styled.RateText>{dexName}</Styled.RateText>
			</div>

			<div className="d-flex flex-row align-items-center justify-content-end">
				<Styled.RateText className={isMobile ? "mr-2" : "mr-3"}>
					{item.rate?.toFixed(6)} {pair.destination?.token?.symbol}/{pair.deposit?.token?.symbol}
				</Styled.RateText>
				{index === 0 ? (
					<span className="label label-inline label-lg label-light-primary">{t("best")}</span>
				) : (
					<span
						style={{
							display: "block",
							flexBasis: 55,
							minWidth: 55,
						}}
					/>
				)}
			</div>
		</Styled.PlatformCard>
	);
};

export default RateOption;

import { useTranslation } from "react-i18next";
import useTheme from "../../../hooks/useTheme";
import CircleLoading from "../../CircleLoading";
import * as Styled from "./styleds";

export type RefreshRatesButtonProps = {
	loading?: boolean;
	priceLoading?: boolean;
	onRefresh: () => void;
};

const RefreshRatesButton = ({ loading, priceLoading, onRefresh }: RefreshRatesButtonProps) => {
	const { t } = useTranslation();
	const theme = useTheme();

	return (
		<Styled.LoadingContainer onClick={onRefresh}>
			<Styled.LoadingText>{t("instantSwap.refreshPrice")}</Styled.LoadingText>
			<CircleLoading fill={theme.primary} loading={loading} priceLoading={priceLoading} />
		</Styled.LoadingContainer>
	);
};

export default RefreshRatesButton;

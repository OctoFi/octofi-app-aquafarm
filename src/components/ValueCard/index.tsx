import { useContext } from "react";
import { ThemeContext } from "styled-components";

import AssetIcon from "../../assets/images/account/assets.svg";
import DebtIcon from "../../assets/images/account/debts.svg";
import NetWorthIcon from "../../assets/images/account/networth.svg";
import CurrencyText from "../CurrencyText";
import Loading from "../Loading";
import * as Styled from "./styleds";

const icons: any = {
	assets: AssetIcon,
	debts: DebtIcon,
	netWorth: NetWorthIcon,
};

export type ValueCardProps = {
	className?: string;
	color?: any;
	value: string;
	title: string;
	type: string;
	show?: boolean;
	loading?: boolean;
};

function ValueCard({
	className = "",
	value,
	title,
	type,
	color = "primary",
	show = true,
	loading = false,
}: ValueCardProps) {
	const theme = useContext(ThemeContext);
	// @ts-ignore
	const themeColor = theme[color];

	if (loading) {
		return <Loading width={55} height={55} active color={"primary"} />;
	}

	if (!show) {
		return null;
	}

	return (
		<Styled.Card className={className}>
			<Styled.CardBody>
				<Styled.CardIcon color={themeColor}>
					<Styled.Img src={icons[type] || icons["assets"]} alt={type} />
				</Styled.CardIcon>
				<Styled.CardContent>
					<Styled.Title>{title}</Styled.Title>
					<Styled.Value>
						<CurrencyText>{value}</CurrencyText>
					</Styled.Value>
				</Styled.CardContent>
			</Styled.CardBody>
		</Styled.Card>
	);
}

export default ValueCard;

import { useContext } from "react";
import { ThemeContext } from "styled-components";

import CurrencyText from "../CurrencyText";
import AssetIcon from "../../assets/images/assets/assets.svg";
import DebtIcon from "../../assets/images/assets/debts.svg";
import NetWorthIcon from "../../assets/images/assets/networth.svg";
import * as Styled from "./styleds";

const icons: any = {
	assets: AssetIcon,
	debts: DebtIcon,
	netWorth: NetWorthIcon,
};

export type ValueCardProps = {
	className: string;
	value: string;
	title: string;
	type: string;
	color: any;
};

function ValueCard({ className, value, title, type, color = "primary" }: ValueCardProps) {
	const theme = useContext(ThemeContext);
	// @ts-ignore
	const themeColor = theme[color];
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

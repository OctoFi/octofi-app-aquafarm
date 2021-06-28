import { useContext } from "react";
import { ThemeContext } from "styled-components";

import CurrencyText from "../CurrencyText";
import AssetIcon from "../../assets/images/assets/assets.svg";
import DebtIcon from "../../assets/images/assets/debts.svg";
import NetWorthIcon from "../../assets/images/assets/networth.svg";
import { Card, CardBody, CardIcon, CardContent, Img, Title, Value } from "./styleds";

const icons: any = {
	assets: AssetIcon,
	debts: DebtIcon,
	netWorth: NetWorthIcon,
};

function ValueCard({ className, value, title, type, color = "primary" }: any) {
	const theme = useContext(ThemeContext);
	// @ts-ignore
	const themeColor = theme[color];
	return (
		<Card className={className}>
			<CardBody>
				<CardIcon color={themeColor}>
					<Img src={icons[type] || icons["assets"]} alt={type} />
				</CardIcon>
				<CardContent>
					<Title>{title}</Title>
					<Value>
						<CurrencyText>{value}</CurrencyText>
					</Value>
				</CardContent>
			</CardBody>
		</Card>
	);
}

export default ValueCard;

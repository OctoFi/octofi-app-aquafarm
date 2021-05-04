import styled from "styled-components";
import { ResponsiveCard } from "../../../../components/Card";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { OrderSide } from "../../../../constants";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
	InputGroupFormControl as FormControl,
	InputGroupPrepend,
	InputGroup,
	InputGroupText,
} from "../../../../components/Form";
import { useETHBalances, useTokenBalances } from "../../../../state/wallet/hooks";
import { useActiveWeb3React } from "../../../../hooks";
import { toast } from "react-hot-toast";
import { useOrderBuilder } from "../../../../state/margin/hooks";

const Card = styled(ResponsiveCard)`
	margin-bottom: 20px;

	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 580px;
		height: 385px;
		margin-bottom: 10px;

		& .card-body {
			padding: 20px;
			display: flex;
			flex-direction: column;
		}
	}
`;

const QuoteContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: -5px;

	@media (max-width: 1400px) {
		padding-top: 0;
		margin-bottom: -24px;
	}
`;

const TabsContainer = styled.div`
	margin-left: -20px;
	margin-right: -20px;
	margin-bottom: 10px;

	@media (max-width: 1400px) {
		flex-direction: column-reverse;
		align-items: stretch !important;
		margin-bottom: 45px;
	}
`;

const TabWrapper = styled.div`
	padding: 0 20px;
	flex: 1;

	@media (max-width: 1400px) {
		&:not(:first-child) {
			margin-bottom: 10px;
		}
	}
`;

const Tab = styled(Button)`
	height: 48px;
	font-size: 1rem;
	font-weight: 500;
	width: 100%;
`;

const Content = styled.div`
	flex: 1;
	position: relative;
`;

const DetailsContainer = styled.div`
	margin-bottom: auto;
`;

const MarketType = styled.div`
	position: absolute;
	top: -14px;
	right: 0;
	z-index: 2;
`;

const MarketButton = styled.button`
	:disabled {
		color: ${({ theme }) => theme.text1};
		opacity: 1;
	}
`;

const FormContainer = styled.div`
	margin-top: 24px;
`;

const Label = styled.label`
	padding: 0 32px;
	font-size: 0.875rem;
`;

const orderTypes = {
	limit: "Limit",
	market: "Market",
	stopLimit: "Stop Limit",
};

const BuyOrSell = (props) => {
	const { account } = useActiveWeb3React();
	const [activeSide, setActiveSide] = useState(OrderSide.Buy);
	const [activeOrderType, setActiveOrderType] = useState("limit");
	const [price, setPrice] = useState("");
	const [amount, setAmount] = useState("");
	const { t } = useTranslation();
	const orderBuilder = useOrderBuilder();
	const selectedMarketStats = useSelector((state) => state.margin.selectedMarketStats);

	const submitHandler = async () => {
		const transformedPrice = Number(price);
		const transformedAmount = Number(amount);

		if (isNaN(transformedAmount) || isNaN(transformedPrice)) {
			toast.error("Please enter valid Number");
		}

		const orderBody = {
			marketId: selectedMarketStats.id,
			side: activeSide === OrderSide.Buy ? "buy" : "sell",
			orderType: activeOrderType,
			walletType: "trading",
			price: activeOrderType === "market" ? "0" : `${transformedPrice}`,
			amount: activeOrderType === "market" ? `${transformedPrice}` : `${transformedAmount}`,
		};

		const res = await orderBuilder(orderBody);
		if (res) {
			setActiveSide(OrderSide.Buy);
			setActiveOrderType("limit");
			setPrice("");
			setAmount("");
		}
	};

	return (
		<Card>
			<TabsContainer className="d-flex align-items-center justify-content-between">
				<TabWrapper>
					<Tab
						variant={activeSide === OrderSide.Buy ? "secondary-light" : "light-secondary-light"}
						onClick={setActiveSide.bind(this, OrderSide.Buy)}
					>
						{t("orderSide.buy")}
					</Tab>
				</TabWrapper>
				<TabWrapper>
					<Tab
						variant={activeSide === OrderSide.Sell ? "secondary-light" : "light-secondary-light"}
						onClick={setActiveSide.bind(this, OrderSide.Sell)}
					>
						{t("orderSide.sell")}
					</Tab>
				</TabWrapper>
			</TabsContainer>
			<Content>
				<MarketType>
					{selectedMarketStats?.supportedOrderTypes?.map((tab, index) => {
						return (
							<>
								<MarketButton
									className="btn btn-link px-0"
									disabled={tab === activeOrderType}
									onClick={() => {
										setActiveOrderType(tab);
									}}
								>
									{orderTypes[tab]}
								</MarketButton>
								{index < selectedMarketStats?.supportedOrderTypes?.length - 1 && (
									<span className={"px-2"}>/</span>
								)}
							</>
						);
					})}
				</MarketType>
				<FormContainer>
					<Label htmlFor="price">{activeOrderType === "limit" ? "Price" : "Amount"}</Label>
					<InputGroup>
						<InputGroupPrepend>
							<InputGroupText>{selectedMarketStats?.quoteAsset}</InputGroupText>
						</InputGroupPrepend>
						<FormControl
							type={"text"}
							placeholder={"Price"}
							id={"price"}
							value={price}
							onChange={(e) => {
								setPrice(e.target.value);
							}}
						/>
					</InputGroup>
				</FormContainer>
				{(activeOrderType === "limit" || activeOrderType === "stopLimit") && (
					<FormContainer>
						<Label htmlFor="amount">Amount</Label>
						<InputGroup>
							<InputGroupPrepend>
								<InputGroupText>{selectedMarketStats?.baseAsset}</InputGroupText>
							</InputGroupPrepend>
							<FormControl
								type={"text"}
								placeholder={"Amount"}
								id={"amount"}
								value={amount}
								onChange={(e) => {
									setAmount(e.target.value);
								}}
							/>
						</InputGroup>
					</FormContainer>
				)}
				<div className="d-flex flex-column align-items-xl-center align-items-stretch justify-content-center mt-auto">
					<Button
						disabled={
							account &&
							(price === "" || (activeOrderType === "limit" && amount === "") || !selectedMarketStats)
						}
						variant={"primary"}
						onClick={submitHandler}
						style={{
							minWidth: 250,
							height: 56,
							marginTop: 15,
							fontSize: 20,
							fontWeight: 700,
						}}
					>
						{!account
							? t("wallet.connect")
							: `${activeSide === OrderSide.Buy ? t("orderSide.buy") : t("orderSide.sell")} ${
									selectedMarketStats?.baseAsset || ""
							  }`}
					</Button>
				</div>
			</Content>
		</Card>
	);
};

export default BuyOrSell;

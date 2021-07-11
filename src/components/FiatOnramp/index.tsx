import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
// @ts-ignore
import TransakSDK from "@transak/transak-sdk";

import { TYPING_INTERVAL } from "../../constants";
import TransakApi from "../../http/transak";
import { useActiveWeb3React } from "../../hooks";
import Card from "../Card";
import CryptoInput from "../CryptoInput";
import Loading from "../Loading";
import * as Styled from "./styleds";
import useTheme from "../../hooks/useTheme";

const FiatOnramp = () => {
	const { account } = useActiveWeb3React();
	const theme = useTheme();
	const { t } = useTranslation();
	const api = new TransakApi(process.env.REACT_APP_TRANSAK_ENVIRONMENT);
	let typeTimeout: any = undefined;
	const [loading, setLoading] = useState(true);
	const [priceLoading, setPriceLoading] = useState(false);
	const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
	const [fiatCurrencies, setFiatCurrencies] = useState([]);
	const [selectedCrypto, setSelectedCrypto] = useState({});
	const [selectedCryptoValue, setSelectedCryptoValue] = useState<number | string>("");
	const [selectedFiat, setSelectedFiat] = useState({});
	const [selectedFiatValue, setSelectedFiatValue] = useState<number | string>("");
	const [conversionRate, setConversionRate] = useState(0);

	useEffect(() => {
		const getCurrencies = async () => {
			try {
				await api.get("crypto")?.then((result) => {
					setCryptoCurrencies(result.data.response);
					setSelectedCrypto(
						result.data.response.find(
							(item: any) => item.symbol === process.env.REACT_APP_TRANSAK_CRYPTO_SYMBOL
						) || null
					);
				});

				await api.get("fiat")?.then((result) => {
					setFiatCurrencies(result.data.response);
					setSelectedFiat(
						result.data.response.find(
							(item: any) => item.symbol === process.env.REACT_APP_TRANSAK_FIAT_SYMBOL
						) || null
					);
				});

				setLoading(false);
			} catch (e) {
				toast.error("Something went wrong. Please try again later.");
				setLoading(false);
			}
		};

		getCurrencies();
	}, []);

	const fetchPrices = async (value: any, type: string) => {
		try {
			setPriceLoading(true);
			debugger;
			const prices = await api.get("price", {
				type: "BUY",
				fiat: selectedFiat?.symbol,
				crypto: selectedCrypto?.symbol,
				amount: Number(value) || 300,
				amountType: type,
				network: type === "crypto" ? value.network.name : selectedCrypto?.network?.name,
			});

			let fiatValue = 0;
			let cryptoValue = 0;
			if (type === "fiat") {
				fiatValue = value;
				cryptoValue = prices?.data?.response?.cryptoAmount;
			} else {
				cryptoValue = value;
				fiatValue = prices?.data?.response?.fiatAmount;
			}

			setSelectedFiatValue(fiatValue);
			setSelectedCryptoValue(cryptoValue);

			setPriceLoading(false);
		} catch (e) {
			if (e.hasOwnProperty("response")) {
				toast.error(e?.response?.data?.error?.message);
			}

			if (type === "fiat") {
				setSelectedFiatValue(value);
			} else {
				setSelectedCryptoValue(value);
			}

			setPriceLoading(false);
		}
	};

	const onUserInputHandler = async (value: any, type: string) => {
		if (selectedFiat && selectedCrypto) {
			clearTimeout(typeTimeout);
			typeTimeout = setTimeout(() => {
				fetchPrices(value, type);
			}, TYPING_INTERVAL);

			if (type === "fiat") {
				setSelectedFiatValue(value);
			} else {
				setSelectedCryptoValue(value);
			}
			console.log(selectedFiat);
		} else {
			if (type === "fiat") {
				setSelectedFiatValue(value);
			} else {
				setSelectedCryptoValue(value);
			}
			setPriceLoading(false);
		}
	};

	const onSelect = async (value: any, type: string) => {
		setPriceLoading(true);

		let cryptoValue = "";
		if ((selectedCrypto !== null || type === "crypto") && (selectedFiat !== null || type === "fiat")) {
			try {
				const prices = await api.get("price", {
					type: "BUY",
					fiat: type === "fiat" ? value.symbol : selectedFiat?.symbol,
					crypto: type === "crypto" ? value.symbol : selectedCrypto?.symbol,
					amount: selectedFiatValue || 300,
					amountType: "fiat",
					network: type === "crypto" ? value.network.name : selectedCrypto?.network?.name,
				});

				if (selectedFiatValue) {
					cryptoValue = prices?.data?.response?.cryptoAmount;
				}

				if (type === "crypto") {
					setSelectedCrypto(value);
					setSelectedCryptoValue(cryptoValue);
					setPriceLoading(false);
					setConversionRate(prices?.data?.response?.conversionPrice);
				} else {
					setSelectedFiat(value);
					setSelectedCryptoValue(cryptoValue);
					setPriceLoading(false);
					setConversionRate(prices?.data?.response?.conversionPrice);
				}
			} catch (e) {
				if (e.hasOwnProperty("response")) {
					toast.error(e?.response?.data?.error?.message);
				}

				if (type === "fiat") {
					setSelectedFiat(value);
				} else {
					setSelectedCrypto(value);
				}

				setPriceLoading(false);
				setConversionRate(0);
			}
		}
	};

	const buyHandler = () => {
		if (!account) {
			// TODO: fix
			// props.toggleWalletModal();
		} else {
			let transak = new TransakSDK({
				apiKey: process.env.REACT_APP_TRANSAK_API_KEY,
				environment: process.env.REACT_APP_TRANSAK_ENVIRONMENT,
				walletAddress: account,
				themeColor: theme.primary,
				hostURL: window.location.origin,
				widgetHeight: "650px",
				widgetWidth: "500px",
				fiatAmount: Number(selectedFiatValue),
				fiatCurrency: selectedFiat?.symbol,
				defaultCryptoCurrency: selectedCrypto?.symbol,
			});

			transak.init();

			transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
				toast.success("Your Purchase was completed Successfully! You can see your assets in dashboard.");
				transak.close();
			});
			transak.on(transak.EVENTS.ORDER_COMPLETED, (orderData) => {
				toast.success("Your Purchase was completed Successfully. You can see your assets in dashboard.");
				transak.close();
			});
			transak.on(transak.EVENTS.TRANSAK_ORDER_CANCELLED, (orderData) => {
				toast.error("You Canceled The Purchase. Maybe the next time!");
				transak.close();
			});
			transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData) => {
				toast.error("Your order failed unfortunately. Please try again later.");
				transak.close();
			});
			transak.on(transak.EVENTS.ORDER_FAILED, (orderData) => {
				toast.error("Your order process failed unfortunately, Please try again later");
				transak.close();
			});
		}
	};

	const checkLimits = () => {
		if (selectedFiat?.symbol === "INR") {
			return (
				!selectedCrypto ||
				!selectedCryptoValue ||
				!selectedFiatValue ||
				!selectedFiat ||
				selectedFiatValue < 750
			);
		} else {
			return (
				!selectedCrypto || !selectedCryptoValue || !selectedFiatValue || !selectedFiat || selectedFiatValue < 10
			);
		}
	};

	if (loading) {
		return (
			<div className="py-5 d-flex align-items-center justify-content-center">
				<Loading width={40} height={40} active />
			</div>
		);
	}

	return (
		<Card>
			<div className="mb-3">
				<CryptoInput
					value={selectedFiatValue}
					onUserInput={onUserInputHandler}
					label={t("currency")}
					onSelect={onSelect}
					selected={selectedFiat}
					currencies={fiatCurrencies}
					type={"fiat"}
					id={"fiat"}
				/>
			</div>

			<div className="mb-4">
				<CryptoInput
					value={selectedCryptoValue}
					onUserInput={onUserInputHandler}
					label={`${t("amount")} (${t("estimated")})`}
					onSelect={onSelect}
					selected={selectedCrypto}
					currencies={cryptoCurrencies}
					type={"crypto"}
					id={"crypto"}
					reverse={false}
				/>

				<Styled.PriceText>
					{selectedFiat && selectedCrypto
						? `1 ${selectedCrypto?.symbol} ≈ ${(conversionRate > 0
								? 1 / conversionRate
								: 1 / selectedCrypto?.priceUSD
						  ).toFixed(4)} ${selectedFiat?.symbol}`
						: ""}
				</Styled.PriceText>
			</div>

			<div className={"d-flex align-items-center justify-content-center"}>
				<Styled.BuyButton
					onClick={buyHandler}
					className={"py-3 d-flex align-items-center justify-content-center"}
					disabled={(checkLimits() && account) || priceLoading}
					variant={!checkLimits() ? "primary" : "outline-primary"}
				>
					{priceLoading ? (
						<Loading width={24} height={24} active color={checkLimits() ? "primary" : "#fff"} />
					) : !account ? (
						t("wallet.connect")
					) : !selectedCrypto ? (
						t("exchange.selectCrypto")
					) : !selectedFiat ? (
						t("exchange.selectFiat")
					) : !selectedFiatValue || !selectedCryptoValue ? (
						t("exchange.enterAmount")
					) : checkLimits() ? (
						t("exchange.lowValue")
					) : (
						t("fiatOn.buyButton")
					)}
				</Styled.BuyButton>
			</div>
		</Card>
	);
};

export default FiatOnramp;

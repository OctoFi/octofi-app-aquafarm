import { FiatOffItem } from "../typings";
import GiftImage from "../assets/images/fiatOff/gift.svg";
import PassportImage from "../assets/images/fiatOff/passport.svg";
import ShoppingImage from "../assets/images/fiatOff/shopping.svg";
import BitrefillImage from "../assets/images/fiatOff/bitrefill.png";
import BitdialsImage from "../assets/images/fiatOff/bitdials.png";
import BitcarsImage from "../assets/images/fiatOff/bitcars.png";
import EgifterImage from "../assets/images/fiatOff/egifter.png";
import CoinsbeeImage from "../assets/images/fiatOff/coinsbee.png";
import BitgildImage from "../assets/images/fiatOff/bitgild.png";
import TravalaImage from "../assets/images/fiatOff/travala.png";
import GivingImage from "../assets/images/fiatOff/giving.png";

const items: Array<FiatOffItem> = [
	{
		thumbnail: BitrefillImage,
		title: "Bitrefill",
		url: "https://www.bitrefill.com",
		traits: [
			{
				title: "Gift Cards",
				icon: GiftImage,
			},
			{
				title: "BTC / ETH",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: BitdialsImage,
		title: "BitDials",
		url: "https://www.bitdials.eu",
		traits: [
			{
				title: "Luxury Goods",
				icon: GiftImage,
			},
			{
				title: "BTC / Alts",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: BitcarsImage,
		title: "BitCars",
		url: "https://bitcars.eu",
		traits: [
			{
				title: "Cars",
				icon: GiftImage,
			},
			{
				title: "BTC / Alts",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: EgifterImage,
		title: "eGifter",
		url: "https://www.egifter.com",
		traits: [
			{
				title: "Gift Cards",
				icon: GiftImage,
			},
			{
				title: "BTC / ETH",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: CoinsbeeImage,
		title: "Coinsbee",
		url: "https://www.coinsbee.com/en/",
		traits: [
			{
				title: "Gift Cards",
				icon: GiftImage,
			},
			{
				title: "BTC / Alts",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: BitgildImage,
		title: "Bitgild",
		url: "https://www.bitgild.com",
		traits: [
			{
				title: "Gold & Silver",
				icon: GiftImage,
			},
			{
				title: "BTC / ETH",
				icon: ShoppingImage,
			},
			{
				title: "KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: TravalaImage,
		title: "Travala",
		url: "https://www.travala.com",
		traits: [
			{
				title: "Travel",
				icon: GiftImage,
			},
			{
				title: "BTC / Alts",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
	{
		thumbnail: GivingImage,
		title: "The Giving Block",
		url: "https://www.thegivingblock.com/donate-bitcoin",
		traits: [
			{
				title: "Charity",
				icon: GiftImage,
			},
			{
				title: "BTC / ETH",
				icon: ShoppingImage,
			},
			{
				title: "No KYC",
				icon: PassportImage,
			},
		],
	},
];

export default items;

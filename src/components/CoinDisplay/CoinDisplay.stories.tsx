import { ComponentStory, ComponentMeta } from "@storybook/react";

import { CoinDisplay } from "./CoinDisplay";

const token = {
	name: "Ethereum",
	symbol: "ETH",
	image: "https://zapper.fi/images/ETH-icon.png",
};

export default {
	title: "Components/CoinDisplay",
	component: CoinDisplay,
} as ComponentMeta<typeof CoinDisplay>;

const Template: ComponentStory<typeof CoinDisplay> = (args) => <CoinDisplay {...args} />;

export const Default = Template.bind({});
Default.args = {
	name: token.name,
	symbol: token.symbol,
	image: token.image,
};

export const Loading = Template.bind({});
Loading.args = {
	name: token.name,
	symbol: token.symbol,
	image: token.image,
	loading: true,
};

export const NoImage = Template.bind({});
NoImage.args = {
	name: token.name,
	symbol: token.symbol,
};

export const NoName = Template.bind({});
NoName.args = {
	symbol: token.symbol,
	image: token.image,
};

export const NoSymbol = Template.bind({});
NoSymbol.args = {
	name: token.name,
	image: token.image,
};

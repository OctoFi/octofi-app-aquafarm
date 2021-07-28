import { ComponentStory, ComponentMeta } from "@storybook/react";

import { AppBar } from "./AppBar";
import { routes } from "../../constants/appbarRoutes";

export default {
	title: "Components/AppBar",
	component: AppBar,
} as ComponentMeta<typeof AppBar>;

const Template: ComponentStory<typeof AppBar> = (args) => <AppBar {...args} />;

export const Default = Template.bind({});
Default.args = {
	routes: routes,
};

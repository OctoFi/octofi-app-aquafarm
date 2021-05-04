import React, { useMemo } from "react";
import styled, {
	ThemeProvider as StyledComponentsThemeProvider,
	createGlobalStyle,
	css,
	DefaultTheme,
} from "styled-components";
import { Text, TextProps } from "rebass";
import { useIsDarkMode } from "../state/user/hooks";
import { Colors } from "./styled";

export * from "./components";

const MEDIA_WIDTHS = {
	upToExtraSmall: 500,
	upToSmall: 720,
	upToMedium: 960,
	upToLarge: 1280,
};

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
	(accumulator, size) => {
		(accumulator as any)[size] = (a: any, b: any, c: any) => css`
			@media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
				${css(a, b, c)}
			}
		`;
		return accumulator;
	},
	{}
) as any;

const white = "#FFFFFF";
const black = "#000000";

export function colors(darkMode?: boolean): Colors {
	return {
		// base
		white,
		black,
		// text
		text1: darkMode ? "#ffffff" : "#000000",
		text2: darkMode ? "#D3D6E8" : "#B1B2B6",
		text3: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
		text4: darkMode ? "rgba(255, 255, 255, 0.3)" : "#CACCD2",

		// backgrounds / greys
		bg1: darkMode ? "#232429" : "#FFFFFF",
		bg2: darkMode ? "#232429" : "#FFFFFF",
		bg3: darkMode ? "rgba(33, 36, 41, 1)" : "#FFF",
		bg4: darkMode ? "#232429" : "rgb(212, 218, 242)",
		bg5: darkMode ? `rgba(255, 255, 255, 0.15) `: `rgba(0, 0, 0, 0.15)`,
		backdrop: "rgba(33, 36, 41, 0.5)",

		//specialty colors
		modalBG: darkMode ? "#272a31" : "#F3F5FD",
		advancedBG: darkMode ? "#232429" : "#FFFFFF",

		//primary colors
		primary1: "#87dce1",

		// color text
		primaryText1: "#87dce1",

		// secondary colors
		secondary1: "#a890fe",
		secondary2: "#a890fe",

		bodyBg: darkMode
			? "linear-gradient(201.32deg, #222429 -48.82%, #232429 51.35%)"
			: "linear-gradient(201.32deg, #fff -48.82%, #fff 51.35%)",
		splashBG: darkMode
			? "linear-gradient(201.32deg, #4E5780 -48.82%, #232429 51.35%)"
			: "linear-gradient(201.32deg, #d4daf2 -48.82%, #fff 51.35%)",

		// other
		red1: "#EB6B6B",
		green1: "#4AC8AA",
		yellow1: "#F3BA2F",
		blue1: "#87dce1",

		danger: "#EB6B6B",
		dangerLight: "rgba(235, 107, 107, 0.15)",
		warning: "#F3BA2F",
		success: "#4AC8AA",
		primary: "#87dce1",
		primaryLight: "rgba(135,220,225, 0.15)",
		secondary: "#a890fe",
		tertiary: "#FBAA9E",
	};
}

export function theme(darkMode?: boolean): DefaultTheme {
	return {
		...colors(darkMode),

		grids: {
			sm: 8,
			md: 12,
			lg: 24,
		},

		//shadows
		shadow1: "#87dce1",

		// media queries
		mediaWidth: mediaWidthTemplates,

		// css snippets
		flexColumnNoWrap: css`
			display: flex;
			flex-flow: column nowrap;
		`,
		flexRowNoWrap: css`
			display: flex;
			flex-flow: row nowrap;
		`,
	};
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	const darkMode = useIsDarkMode();

	const themeObject = useMemo(() => theme(darkMode), [darkMode]);

	return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>;
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
	color: ${({ color, theme }) => (theme as any)[color]};
`;

export const TYPE = {
	main(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text2"} {...props} />;
	},
	link(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
	},
	black(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text1"} {...props} />;
	},
	white(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"white"} {...props} />;
	},
	body(props: TextProps) {
		return <TextWrapper fontWeight={400} fontSize={16} color={"text1"} {...props} />;
	},
	largeHeader(props: TextProps) {
		return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
	},
	mediumHeader(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
	},
	subHeader(props: TextProps) {
		return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
	},
	small(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={11} {...props} />;
	},
	blue(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
	},
	yellow(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"yellow1"} {...props} />;
	},
	darkGray(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text3"} {...props} />;
	},
	gray(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"bg3"} {...props} />;
	},
	italic(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={12} fontStyle={"italic"} color={"text2"} {...props} />;
	},
	error({ error, ...props }: { error: boolean } & TextProps) {
		return <TextWrapper fontWeight={500} color={error ? "red1" : "text2"} {...props} />;
	},
};

export const FixedGlobalStyle = createGlobalStyle`

html, body { font-family: "Inter", "system-ui" !important; }

@supports (font-variation-settings: normal) {
  html, body { font-family: "Inter var", "system-ui" !important; }
}

html {
  overflow: hidden !important;
}
html,body {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}


.modal-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}
`;

export const ThemedGlobalStyle = createGlobalStyle`

html,body {
  color: ${({ theme }) => theme.text1};
}
body {
  background-color: ${({ theme }) => theme.bg1};
  background-image: ${({ theme }) => theme.bodyBg};
  color: ${({ theme }) => theme.text1};
}
`;

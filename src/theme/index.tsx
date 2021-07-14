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
	upToExtraSmall: 575,
	upToSmall: 767,
	upToMedium: 991,
	upToLarge: 1199,
	upToExtraLarge: 1399,
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
		// Base
		white,
		black,

		// Text
		text1: darkMode ? white : black,
		text2: darkMode ? "#D3D6E8" : "#B1B2B6",
		text3: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
		text4: darkMode ? "rgba(255, 255, 255, 0.3)" : "#CACCD2",

		// Backgrounds
		bg1: darkMode ? "#232429" : white,
		bg2: darkMode ? "#232429" : white,
		bg3: darkMode ? "#3d4046" : white,
		bg4: darkMode ? "#232429" : "#d4daf2",
		bg5: darkMode ? `rgba(255, 255, 255, 0.1) ` : `rgba(0, 0, 0, 0.05)`,

		// UI
		borderColor: darkMode ? `rgba(255, 255, 255, 0.05) ` : `rgba(0, 0, 0, 0.05)`,
		borderColor2: darkMode ? `rgba(255, 255, 255, 0.15) ` : `rgba(0, 0, 0, 0.15)`,
		bodyBg: darkMode
			? "linear-gradient(201.32deg, #222429 -48.82%, #232429 51.35%)"
			: "linear-gradient(201.32deg, #fff -48.82%, #fff 51.35%)",
		splashBG: darkMode
			? "linear-gradient(201.32deg, #4E5780 -48.82%, #232429 51.35%)"
			: "linear-gradient(201.32deg, #d4daf2 -48.82%, #fff 51.35%)",
		backdrop: "rgba(33, 36, 41, 0.5)",
		modalBG: darkMode ? "#272a31" : "#F3F5FD",
		advancedBG: darkMode ? "#232429" : white,
		warning: "#F3BA2F",
		danger: "#EB6B6B",
		dangerLight: "rgba(235, 107, 107, 0.15)",
		success: "#34D399",

		// Primaries
		primary: "#0891B2",
		primaryLight: "rgba(6, 115, 141, 0.15)",
		secondary: "#a890fe", // purple
		secondaryLight: "rgba(121, 133, 246, 0.15)",
		tertiary: "#FBAA9E", // pinkish

		// Other
		red1: "#EB6B6B",
		green1: "#34D399",
		yellow1: "#F3BA2F",
		blue1: "#0891B2",
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
		shadow1: "#0891B2",

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
	Main(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text2"} {...props} />;
	},
	Link(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"primary"} {...props} />;
	},
	Black(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text1"} {...props} />;
	},
	White(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"white"} {...props} />;
	},
	Body(props: TextProps) {
		return <TextWrapper fontWeight={400} fontSize={16} color={"text1"} {...props} />;
	},
	LargeHeader(props: TextProps) {
		return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
	},
	MediumHeader(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
	},
	SubHeader(props: TextProps) {
		return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
	},
	Small(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={11} {...props} />;
	},
	Blue(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"primary"} {...props} />;
	},
	Yellow(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"yellow1"} {...props} />;
	},
	DarkGray(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"text3"} {...props} />;
	},
	Gray(props: TextProps) {
		return <TextWrapper fontWeight={500} color={"bg4"} {...props} />;
	},
	Italic(props: TextProps) {
		return <TextWrapper fontWeight={500} fontSize={12} fontStyle={"italic"} color={"text2"} {...props} />;
	},
	Error({ error, ...props }: { error: boolean } & TextProps) {
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

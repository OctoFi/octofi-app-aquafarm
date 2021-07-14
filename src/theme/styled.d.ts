import { FlattenSimpleInterpolation, ThemedCssFunction } from "styled-components";

export type Color = string;
export interface Colors {
	// Base
	white: Color;
	black: Color;

	// Text
	text1: Color;
	text2: Color;
	text3: Color;
	text4: Color;

	// Backgrounds
	bg1: Color;
	bg2: Color;
	bg3: Color;
	bg4: Color;
	bg5: Color;
	
	// UI
	borderColor: Color;
	borderColor2: Color;
	bodyBg: Color;
	splashBG: Color;
	backdrop: Color;
	modalBG: Color;
	advancedBG: Color;
	warning: Color;
	danger: Color;
	dangerLight: Color;
	success: Color;

	// Primaries
	primary: Color;
	primaryLight: Color;
	secondary: Color;
	secondaryLight: Color;
	tertiary: Color;

	// Other
	red1: Color;
	green1: Color;
	yellow1: Color;
	blue1: Color;
}

export interface Grids {
	sm: number;
	md: number;
	lg: number;
}

declare module "styled-components" {
	export interface DefaultTheme extends Colors {
		grids: Grids;

		// shadows
		shadow1: string;

		// media queries
		mediaWidth: {
			upToExtraSmall: ThemedCssFunction<DefaultTheme>;
			upToSmall: ThemedCssFunction<DefaultTheme>;
			upToMedium: ThemedCssFunction<DefaultTheme>;
			upToLarge: ThemedCssFunction<DefaultTheme>;
			upToExtraLarge: ThemedCssFunction<DefaultTheme>;
		};

		// css snippets
		flexColumnNoWrap: FlattenSimpleInterpolation;
		flexRowNoWrap: FlattenSimpleInterpolation;
	}
}

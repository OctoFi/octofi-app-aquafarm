import { useDarkModeManager } from "../../state/user/hooks";
import MoonIcon from "../Icons/Moon";
import SunIcon from "../Icons/Sun";
import * as Styled from "./styleds";

const ThemeToggler = () => {
	const [darkMode, toggleDarkMode] = useDarkModeManager();

	return (
		<Styled.Switch htmlFor="theme-toggle">
			<Styled.SwitchInput type="checkbox" id="theme-toggle" onChange={toggleDarkMode} checked={darkMode} />
			<Styled.SwitchBox>
				<Styled.SwitchBg>
					<MoonIcon size={17} color={"#fff"} />
					<SunIcon size={17} color={"#fc6"} />
				</Styled.SwitchBg>
				<Styled.SwitchBoxInner />
			</Styled.SwitchBox>
		</Styled.Switch>
	);
};

export default ThemeToggler;

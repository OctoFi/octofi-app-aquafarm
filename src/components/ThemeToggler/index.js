import { useDarkModeManager } from "../../state/user/hooks";

import MoonIcon from "../Icons/Moon";
import SunIcon from "../Icons/Sun";

const ThemeToggler = (props) => {
	const [darkMode, toggleDarkMode] = useDarkModeManager();

	return (
		<label htmlFor="theme-toggle" className="switch switch--primary">
			<input
				className="switch__input"
				type="checkbox"
				id="theme-toggle"
				onChange={toggleDarkMode}
				checked={darkMode}
			/>
			<div className="switch__box">
				<div className="switch__bg">
					<MoonIcon size={17} fill={"#fff"} />
					<SunIcon size={17} fill={"#fc6"} />
				</div>
				<span className="switch__box-inner" />
			</div>
		</label>
	);
};

export default ThemeToggler;

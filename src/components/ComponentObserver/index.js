import { useEffect } from "react";

const Observer = ({ value, didUpdate }) => {
	useEffect(() => {
		didUpdate(value);
	}, [value]);
	return null; // component does not render anything
};

export default Observer;

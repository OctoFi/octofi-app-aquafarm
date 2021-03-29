import SVG from "react-inlinesvg";

import Feature1 from "../../assets/images/features/features_1.svg";
import Feature2 from "../../assets/images/features/features_2.svg";
import Feature3 from "../../assets/images/features/features_3.svg";
import Feature4 from "../../assets/images/features/features_4.svg";

const FeatureIcon = (props) => {
	let C = null;
	switch (props.name) {
		case "support": {
			C = Feature1;
			break;
		}
		case "blog": {
			C = Feature2;
			break;
		}
		case "community": {
			C = Feature3;
			break;
		}
		case "careers": {
			C = Feature4;
			break;
		}
		default: {
			C = Feature1;
		}
	}

	return <SVG src={C} />;
};

export default FeatureIcon;

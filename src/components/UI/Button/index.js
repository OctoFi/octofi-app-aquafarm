import "./style.scss";

const Button = ({ className, ...props }) => {
	let classes = ["btn btn-primary btn-gradient-primary"];
	if (className) {
		classes.push(className);
	}
	return (
		<button className={classes.join(" ")} {...props}>
			{props.children}
		</button>
	);
};

export default Button;

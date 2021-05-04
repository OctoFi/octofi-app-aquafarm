import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	align-items: center;
	align-content: center;
	flex-wrap: wrap;
	margin-left: -10px;
	margin-right: -10px;

	& > .item {
		flex-basis: ${({ cols }) => (cols ? `${Math.floor(100 / cols)}%` : "100%")};
	}
`;

const Item = styled.div`
	padding: 10px;

	& button {
		height: 56px;
		font-weight: 500;
		font-size: 1rem;
		width: 100%;

		&.btn-light-primary {
			color: ${({ theme }) => theme.primary};
		}
	}
`;

const SelectCheckbox = (props) => {
	const [active, setActive] = useState(props.active || 0);

	const handleChange = (index) => {
		setActive(index);
		const newActiveItem = props.items[index];

		props.onChangeActive(newActiveItem, index);
	};

	return (
		<Container cols={props.cols || 2}>
			{props.items.map((item, i) => {
				const isActive = i === active;

				return (
					<Item key={`selectbox-${i}`} className={"item"}>
						<button
							className={`btn btn-${isActive ? "primary" : "light-primary"}`}
							onClick={handleChange.bind(this, i)}
						>
							{item}
						</button>
					</Item>
				);
			})}
		</Container>
	);
};

export default SelectCheckbox;

import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { changeGasPrice } from "../../state/currency/actions";

const CustomRow = styled(Row)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 20px 6px;
`;

const GasButton = styled(Button)`
	padding: 10px 30px;
	border-radius: 18px;
	background-color: ${({ selected, theme }) => (selected ? theme.primary : theme.primaryLight)};
	color: ${({ selected, theme }) => (selected ? theme.text1 : theme.primary)};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	border: none;

	:focus,
	:active {
		outline: none;
		box-shadow: none;
	}
`;

const GasName = styled.span`
	font-size: 1rem;
	font-weight: 500;
	margin-bottom: 0.375rem;
	text-transform: capitalize;
`;

const GasValue = styled.span`
	font-size: 0.75rem;
	font-weight: 400;
`;

const GasPrice = (props) => {
	const dispatch = useDispatch();
	const changeSelectedGas = (gas) => {
		dispatch(changeGasPrice(gas));
	};
	return (
		<CustomRow className={"custom-row"}>
			{Array.isArray(props.gasList) &&
				props.gasList.map((item) => {
					const [gas, value] = item;
					return (
						<Col xs={12} md={6} lg={3}>
							<GasButton
								onClick={() => changeSelectedGas(gas)}
								key={gas}
								selected={gas === props.selected}
								className={"mb-3"}
							>
								<GasName className={"font-weight-bolder font-size-lg"}>{gas}</GasName>
								<GasValue className="opacity-70 font-size-sm">({Number.parseInt(value)} Gwei)</GasValue>
							</GasButton>
						</Col>
					);
				})}
		</CustomRow>
	);
};

export default GasPrice;

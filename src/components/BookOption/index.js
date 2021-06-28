import styled from "styled-components";

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: space-between;
	width: 30px;
	height: 30px;
	min-width: 30px;
	min-height: 30px;
	padding: 10px 6px;
	background-color: ${({ theme }) => theme.bg1};
	border-radius: 30px;
	opacity: ${({ active }) => (active ? "1" : "0.5")};
	cursor: pointer;
`;

const Cell = styled.div`
	height: 2px;
	border-radius: 9px;
	width: 13px;
	background-color: ${({ theme, variant }) => (variant ? theme[variant] : "#D3D6E8")};

	&:not(:last-child) {
		width: 17px;
	}
`;

const BookOption = (props) => {
	return (
		<Wrapper active={props.active} onClick={props.onChange} {...props}>
			<Cell variant={props.isSell && "danger"} />
			<Cell />
			<Cell variant={props.isBuy && "success"} />
		</Wrapper>
	);
};

export default BookOption;

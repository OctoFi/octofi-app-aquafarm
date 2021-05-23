import { Card } from "react-bootstrap";
import styled from "styled-components";

const { Header, Body } = Card;

const StyledCard = styled(Card)`
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 12px;
	border: 1px solid ${({ theme }) => theme.text4};
`;

const CustomCard = (props) => {
	return (
		<StyledCard>
			{props.header && <Header>{props.header}</Header>}
			<Body>{props.children || props.body}</Body>
		</StyledCard>
	);
};

export default CustomCard;

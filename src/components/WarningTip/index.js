import { Button as BS, Col } from "react-bootstrap";
import styled from "styled-components";
import { useBetaMessageManager } from "../../contexts/LocalStorage";

const AlertContainer = styled.div`
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 4px 4px 64px;
	background-color: ${({ theme }) => theme.primaryLight};

	@media (max-width: 1199px) {
		padding-left: 48px;
	}

	@media (max-width: 991px) {
		padding-left: 36px;
	}

	@media (max-width: 767px) {
		padding-left: 16px;
	}
`;

const AlertText = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.primary};
	line-height: 21px;
	padding-right: 1rem;
	padding-top: 9px;
	padding-bottom: 9px;
`;

const AlertButton = styled(BS)`
	min-height: 48px;
	height: 48px;
	border-radius: 18px;
	font-weight: 500;
	min-width: 105px;
`;

const WarningTip = (props) => {
	const [showBetaMessage, dismissBetaMessage] = useBetaMessageManager();

	return (
		showBetaMessage && (
			<Col xs={12} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
				<AlertContainer>
					<AlertText>This project is in Beta. Use at your own risk.</AlertText>
					<AlertButton onClick={dismissBetaMessage}>Agree</AlertButton>
				</AlertContainer>
			</Col>
		)
	);
};

export default WarningTip;

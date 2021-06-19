import { Row, Col, Button as BS } from "react-bootstrap";
import styled from "styled-components";
import SVG from "react-inlinesvg";

import Page from "../../components/Page";
import Card from "../../components/Card";
import Img from "../../components/UI/Img";
import fiatOffList from "../../constants/fiatOffList";

const StyledCard = styled(Card)`
	margin-top: 36px;

	& > .card-body {
		padding: 40px 20px;
	}
`;

const InnerCard = styled.div`
	display: flex;
	flex-direction: column;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	padding: 10px;
	align-items: stretch;
	border: 1px solid ${({ theme }) => theme.borderColor};
	margin-bottom: 20px;
`;

const ItemImageContainer = styled.div`
	position: relative;
	width: 100%;
	padding-top: 100%;
	border-radius: 12px;
	overflow: hidden;
	background-color: ${({ theme }) => theme.modalBG};
`;

const ItemImage = styled(Img)`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	object-fit: cover;
`;

const ItemContent = styled.div`
	display: flex;
	align-items: stretch;
	flex-direction: column;
`;

const ItemList = styled.div`
	flex: 1;
	padding: 20px 5px 24px;
	display: grid;
	grid-column-gap: 8px;
	grid-row-gap: 8px;
	grid-template-columns: 35px 1fr;
	align-items: center;
`;

const Button = styled(BS)`
	border-radius: 10px;
	height: 48px;
	min-height: 48px;
`;

const ListIcon = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 35px;
	height: 32px;
	color: ${({theme}) => theme.primary};
`;

const ListTitle = styled.span`
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	line-height: 1.125rem;
`;

const Title = styled.h1`
	margin-top: 0;
	margin-bottom: 40px;
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	line-height: 1.5rem;
`;

const FiatOff = (props) => {
	return (
		<Page hasBg>
			<Row>
				<Col xs={12}>
					<StyledCard>
						<Row className={"custom-row"}>
							<Col xs={12}>
								<Title className={"text-center"}>How to spend your crypto</Title>
							</Col>
							{fiatOffList?.map((item, index) => {
								return (
									<Col xs={12} sm={6} lg={4} xl={3} key={`fiat-off-item-${index}`}>
										<InnerCard>
											<ItemImageContainer>
												<ItemImage src={item?.thumbnail} alt={item?.title} />
											</ItemImageContainer>
											<ItemContent>
												<ItemList>
													{item?.items?.map((listItem) => {
														return (
															<>
																<ListIcon>
																	<SVG src={listItem?.icon} width={24} height={24} />
																</ListIcon>
																<ListTitle>{listItem?.title}</ListTitle>
															</>
														);
													})}
												</ItemList>
												<Button
													as={"a"}
													href={item?.url}
													target={"_blank"}
													className={"btn btn-primary"}
													rel={"noreferrer noopener"}
												>
													Go to {item?.title}
												</Button>
											</ItemContent>
										</InnerCard>
									</Col>
								);
							})}
						</Row>
					</StyledCard>
				</Col>
			</Row>
		</Page>
	);
};

export default FiatOff;

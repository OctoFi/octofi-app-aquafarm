import { Row, Col } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { FiatOffItem } from "../../typings";
import * as Styled from "./styleds";

const OfframpList = ({ items }: { items: Array<FiatOffItem> }) => {
	return (
		<Row>
			{items.map((item, index) => {
				return (
					<Col xs={12} sm={6} lg={4} xl={3} key={`fiat-off-item-${index}`}>
						<Styled.InnerCard>
							<Styled.ItemImageContainer>
								<Styled.ItemImage src={item.thumbnail} alt={item.title} />
							</Styled.ItemImageContainer>
							<Styled.ItemContent>
								<Styled.ItemList>
									{item.traits.map((trait, idx) => {
										return (
											<Styled.ItemTrait key={`fiat-off-item-trait-${idx}`}>
												<Styled.ListIcon>
													<SVG src={trait.icon} width={24} height={24} />
												</Styled.ListIcon>
												<Styled.ListTitle>{trait.title}</Styled.ListTitle>
											</Styled.ItemTrait>
										);
									})}
								</Styled.ItemList>
								<Styled.CustomButton
									as={"a"}
									href={item.url}
									target={"_blank"}
									className={"btn btn-primary"}
									rel={"noreferrer noopener"}
								>
									Go to {item.title}
								</Styled.CustomButton>
							</Styled.ItemContent>
						</Styled.InnerCard>
					</Col>
				);
			})}
		</Row>
	);
};

export default OfframpList;

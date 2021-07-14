import CurrencyText from "../CurrencyText";
import * as Styled from "./styleds";

function OverviewCard({
	className,
	value,
	title,
	icon,
	image,
	theme,
	clickHandler,
	description,
}: {
	className: string | undefined;
	value: string | null;
	title: string;
	icon?: any;
	image?: any;
	theme?: string;
	clickHandler?: any;
	description?: string;
}) {
	return (
		<Styled.Card className={className} onClick={clickHandler}>
			<Styled.CardBody>
				<Styled.CardIcon>
					<Styled.CardImage src={image} alt={title} />
				</Styled.CardIcon>

				<Styled.CardContent>
					<Styled.Title>{title}</Styled.Title>
					<Styled.Value>
						<CurrencyText>{value}</CurrencyText>
					</Styled.Value>
				</Styled.CardContent>
			</Styled.CardBody>
		</Styled.Card>
	);
}

export default OverviewCard;

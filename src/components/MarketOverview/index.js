import styled from "styled-components";
import Skeleton from "react-loading-skeleton";

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const Row = styled.div`
	display: flex;
	align-items: center;

	&:not(:last-child) {
		margin-bottom: 20px;
	}
`;

const Text = styled.span`
	font-weight: 500;
	font-size: ${({ fontSize }) => fontSize};
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const Value = styled.span`
	font-size: 1.25rem;
	font-weight: 500;
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.success)};
	margin-right: 1.25rem;

	@media (min-width: 768px) {
		font-size: 1.5rem;
	}
`;

const PriceChange = styled.span`
	display: inline-flex;
	height: 32px;
	padding: 5px 15px;
	font-size: 1rem;
	background-color: ${({ variant }) =>
		!variant || variant === "success" ? "rgba(74, 200, 170, 0.15)" : "rgba(235, 107, 107, 0.15)"};
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.success)};
	border-radius: 12px;

	@media (min-width: 768px) {
		height: 40px;
		padding: 8px 20px;
	}
`;

const MarketOverview = ({ pair, price, latestPrice, variant, volume, changePercent, row, ...props }) => {
	return (
		<Wrapper>
			<Row>
				<Text fontSize={".875rem"}>{row ? pair : <Skeleton width={100} height={24} />}</Text>
			</Row>
			<Row>
				<Value variant={variant}>{row ? price : <Skeleton width={120} height={30} />}</Value>
			</Row>
			<Row>
				{row ? (
					<PriceChange variant={variant}>{changePercent}</PriceChange>
				) : (
					<Skeleton width={100} height={40} style={{ borderRadius: 12 }} />
				)}
			</Row>
			<Row>{row ? <Text fontSize={"1rem"}>Volume: {volume}</Text> : <Skeleton width={180} height={24} />}</Row>
		</Wrapper>
	);
};

export default MarketOverview;

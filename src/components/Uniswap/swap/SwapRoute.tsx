import { Fragment, memo, useContext } from "react";
import { ChevronRight } from "react-feather";
import { Flex } from "rebass";
import { Trade } from "@uniswap/sdk";
import { TYPE } from "../../../theme";
import CurrencyLogo from "../../CurrencyLogo";
import styled, { ThemeContext } from "styled-components";

const LogoContainer = styled.div`
	width: 24px;
	height: 24px;

	@media (min-width: 768px) {
		width: 34px;
		height: 34px;
	}
`;

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
	const theme = useContext(ThemeContext);
	return (
		<Flex flexWrap="wrap" width="100%" justifyContent="space-between" alignItems="center">
			{trade.route.path.map((token, i, path) => {
				const isLastItem: boolean = i === path.length - 1;
				return (
					<Fragment key={i}>
						<Flex my="0.5rem" alignItems="center" style={{ flexShrink: 0 }}>
							<LogoContainer>
								<CurrencyLogo currency={token} />
							</LogoContainer>
							<TYPE.Black fontSize={16} fontWeight={500} color={theme.text1} ml="0.875rem">
								{token.symbol}
							</TYPE.Black>
						</Flex>
						{isLastItem ? null : <ChevronRight color={theme.text2} />}
					</Fragment>
				);
			})}
		</Flex>
	);
});

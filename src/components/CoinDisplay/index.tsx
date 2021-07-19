import Skeleton from "react-loading-skeleton";
import { isMobile } from "react-device-detect";
import * as Styled from "./styleds";

export type CoinDisplayProps = {
	name?: string;
	symbol?: string;
	image?: string;
};

const CoinDisplay = ({ name, symbol, image }: CoinDisplayProps) => {
	return (
		<div className="d-flex align-items-center">
			{image ? (
				<Styled.CoinIcon src={image} alt={name || symbol} />
			) : (
				<Skeleton
					width={isMobile ? 24 : 32}
					height={isMobile ? 24 : 32}
					circle={true}
					className={isMobile ? "mr-2" : "mr-3"}
				/>
			)}

			<div className="d-flex flex-column">
				{name && <Styled.CoinName>{name}</Styled.CoinName>}
				{symbol && <Styled.CoinSymbol>{symbol}</Styled.CoinSymbol>}
			</div>
		</div>
	);
};

export default CoinDisplay;

import Skeleton from "react-loading-skeleton";
import { isMobile } from "react-device-detect";
import * as Styled from "./styleds";

interface CoinDisplayProps {
	name?: string;
	symbol?: string;
	image?: string;
	loading?: boolean;
}

export const CoinDisplay = ({ name, symbol, image, loading = false }: CoinDisplayProps) => {
	if (loading) {
		return (
			<div className="d-flex align-items-center">
				<Skeleton width={isMobile ? 24 : 32} height={isMobile ? 24 : 32} circle={true} className="mr-3" />

				<div className="d-flex flex-column">
					<Styled.Title>
						<Skeleton width={90} />
					</Styled.Title>
					<Styled.Subtitle>
						<Skeleton width={40} />
					</Styled.Subtitle>
				</div>
			</div>
		);
	}

	return (
		<div className="d-flex align-items-center">
			<Styled.Icon src={image} alt={name || symbol} />

			<div className="d-flex flex-column">
				{name && <Styled.Title>{name}</Styled.Title>}
				{symbol && name ? <Styled.Subtitle>{symbol}</Styled.Subtitle> : <Styled.Title>{symbol}</Styled.Title>}
			</div>
		</div>
	);
};

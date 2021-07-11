import { isMobile } from "react-device-detect";
import SVG from "react-inlinesvg";
import Skeleton from "react-loading-skeleton";
import PinStartIcon from "../../assets/images/governance/pin-start.svg";
import { useLogo } from "../../state/governance/hooks";
import { SnapshotSpaceProps } from "../../typings";
import * as Styled from "./styleds";

export type SnapshotSpaceCardProps = {
	space: SnapshotSpaceProps;
	id: string;
	pinned?: boolean;
	symbolIndex: string;
	loading?: boolean;
};

const SnapshotSpaceCard = ({ space, id, pinned = false, symbolIndex, loading = false }: SnapshotSpaceCardProps) => {
	const LogoURL = useLogo(id, symbolIndex);

	if (loading) {
		return (
			<Styled.Wrapper to={"#"} loading={loading}>
				<Skeleton
					circle={true}
					width={isMobile ? 100 : 66}
					height={isMobile ? 100 : 66}
					style={{ marginBottom: "1.25rem" }}
				/>

				<Styled.Title>
					<Skeleton height={20} width={isMobile ? 80 : 120} />
				</Styled.Title>
				<Styled.CurrencyName>
					<Skeleton height={15} width={isMobile ? 50 : 80} />
				</Styled.CurrencyName>
			</Styled.Wrapper>
		);
	}

	return (
		<Styled.Wrapper to={`/governance/${id}`} loading={loading}>
			{pinned && (
				<Styled.StarWrapper>
					<SVG src={PinStartIcon} width={16} height={16} />
				</Styled.StarWrapper>
			)}

			<Styled.Logo src={LogoURL} />
			<Styled.Title>{space.name}</Styled.Title>
			<Styled.CurrencyName>{space.symbol}</Styled.CurrencyName>
		</Styled.Wrapper>
	);
};

export default SnapshotSpaceCard;

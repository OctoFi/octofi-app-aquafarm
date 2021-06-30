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
	return (
		<Styled.Wrapper to={loading ? "#" : `/governance/${id}`} loading={loading}>
			{!loading && pinned && (
				<Styled.StarWrapper>
					<SVG src={PinStartIcon} width={16} height={16} />
				</Styled.StarWrapper>
			)}
			{loading ? (
				<Skeleton
					circle={true}
					width={isMobile ? 100 : 66}
					height={isMobile ? 100 : 66}
					style={{ marginBottom: "1.25rem" }}
				/>
			) : (
				<Styled.Logo src={LogoURL} />
			)}
			<Styled.Title>{loading ? <Skeleton height={20} width={isMobile ? 80 : 120} /> : space.name}</Styled.Title>
			<Styled.CurrencyName>
				{loading ? <Skeleton height={15} width={isMobile ? 50 : 80} /> : space.symbol}
			</Styled.CurrencyName>
		</Styled.Wrapper>
	);
};

export default SnapshotSpaceCard;

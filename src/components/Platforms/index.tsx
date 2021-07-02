import { Row, Col } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";

import LayoutBlockIcon from "../../assets/images/global/layout-block.svg";
import Loading from "../Loading";
import OverviewCard from "../OverviewCard";
import * as Styled from "./styleds";

export type PlatformsProps = {
	balance: Array<any>;
	onSelectPlatform: (T: string) => void;
	loading?: boolean;
};

export default function Platforms({ balance, onSelectPlatform, loading }: PlatformsProps) {
	const { t } = useTranslation();

	if (loading) {
		return <Loading width={55} height={55} active color={"primary"} />;
	}

	if (balance.length === 0) {
		return (
			<Styled.Wrap className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
				<SVG src={LayoutBlockIcon} width={64} height={64} />
				<h5 className="text-primary font-weight-bolder mb-3 mt-3">{t("errors.noPlatform")}</h5>
				<span className="text-dark-50">{t("errors.noPlatformDesc")}</span>
			</Styled.Wrap>
		);
	}

	return (
		<Row>
			{balance.map((b, index: number) => {
				return (
					<Col key={index} xs={12} md={4}>
						<OverviewCard
							clickHandler={() => onSelectPlatform(b.metadata.name)}
							className={"mb-3"}
							title={b.metadata.name}
							value={b.total.toFixed(4)}
							image={b.metadata.logo.href}
						/>
					</Col>
				);
			})}
		</Row>
	);
}

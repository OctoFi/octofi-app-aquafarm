import { useState } from "react";
import { Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import TokenSetTab from "./TokenSetTab";
import { StyledNav, StyledNavItem, StyledNavLink } from "./styleds";

const TokenSets = (props) => {
	const { t } = useTranslation();
	const [activeKey, setActiveKey] = useState("portfolios");

	return (
		<Page title={"Token Sets"} notNetworkSensitive={false}>
			<ResponsiveCard>
				<Tab.Container defaultActiveKey={"portfolios"} onSelect={(k) => setActiveKey(k)}>
					<StyledNav variant="pills">
						<StyledNavItem>
							<StyledNavLink eventKey="portfolios">{t("tokensets.portfolios")}</StyledNavLink>
						</StyledNavItem>
						<StyledNavItem>
							<StyledNavLink eventKey="rebalancing_sets">{t("tokensets.rebalancingSets")}</StyledNavLink>
						</StyledNavItem>
					</StyledNav>

					<Tab.Content>
						<Tab.Pane eventKey="portfolios">
							<TokenSetTab tabKey={"portfolios"} active={activeKey === "portfolios"} />
						</Tab.Pane>
						<Tab.Pane eventKey="rebalancing_sets">
							<TokenSetTab tabKey={"rebalancing_sets"} active={activeKey === "rebalancing_sets"} />
						</Tab.Pane>
					</Tab.Content>
				</Tab.Container>
			</ResponsiveCard>
		</Page>
	);
};

export default TokenSets;

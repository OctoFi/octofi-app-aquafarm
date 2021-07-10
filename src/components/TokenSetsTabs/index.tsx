import { useState } from "react";
import { Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import TokenSetsTable from "../TokenSetsTable";
import TokenSetTab from "./TokenSetTab";
import * as Styled from "./styleds";

const TokenSetsTabs = () => {
	const { t } = useTranslation();
	const [activeKey, setActiveKey] = useState("portfolios");

	return (
		// @ts-ignore
		<Tab.Container defaultActiveKey={"portfolios"} onSelect={(k) => setActiveKey(k)}>
			<Styled.CustomNav variant="pills">
				<Styled.NavItem>
					<Styled.NavLink eventKey="portfolios">{t("tokensets.portfolios")}</Styled.NavLink>
				</Styled.NavItem>
				<Styled.NavItem>
					<Styled.NavLink eventKey="rebalancing_sets">{t("tokensets.rebalancingSets")}</Styled.NavLink>
				</Styled.NavItem>
				<Styled.NavItem>
					<Styled.NavLink eventKey="other_sets">{t("tokensets.otherSets")}</Styled.NavLink>
				</Styled.NavItem>
			</Styled.CustomNav>

			<Tab.Content>
				<Tab.Pane eventKey="portfolios">
					<TokenSetTab tabKey={"portfolios"} active={activeKey === "portfolios"} />
				</Tab.Pane>
				<Tab.Pane eventKey="rebalancing_sets">
					<TokenSetTab tabKey={"rebalancing_sets"} active={activeKey === "rebalancing_sets"} />
				</Tab.Pane>
				<Tab.Pane eventKey="other_sets">
					<TokenSetsTable />
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};

export default TokenSetsTabs;

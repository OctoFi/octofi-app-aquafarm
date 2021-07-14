import { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "styled-components";
import { Text } from "rebass";

import { useModalOpen, useToggleUniswapSettingsMenu } from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/actions";
import { useUserSlippageTolerance, useUserTransactionTTL } from "../../state/user/hooks";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { AutoColumn } from "../Column";
import TransactionSettings from "../TransactionSettings";
import { Header, CardTitle, StyledMenuIcon, StyledMenu, MenuFlyout, StyledMenuButton } from "./styles";

const SwapHeader = () => {
	const node = useRef();
	const { t } = useTranslation();
	const open = useModalOpen(ApplicationModal.UNISWAPSETTINGS);
	const toggle = useToggleUniswapSettingsMenu();

	const theme = useContext(ThemeContext);
	const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();

	const [ttl, setTtl] = useUserTransactionTTL();

	useOnClickOutside(node, open ? toggle : undefined);

	return (
		<Header className={"d-flex align-items-center justify-content-between"}>
			<CardTitle>{t("convert")}</CardTitle>
			<StyledMenu ref={node}>
				<StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
					<StyledMenuIcon />
				</StyledMenuButton>
				{open && (
					<MenuFlyout>
						<AutoColumn gap="md" style={{ padding: "1rem" }}>
							<Text fontWeight={600} fontSize={14} color={theme.text1 + "80"}>
								Transaction Settings
							</Text>
							<TransactionSettings
								rawSlippage={userSlippageTolerance}
								setRawSlippage={setUserslippageTolerance}
								deadline={ttl}
								setDeadline={setTtl}
							/>
						</AutoColumn>
					</MenuFlyout>
				)}
			</StyledMenu>
		</Header>
	);
};

export default SwapHeader;

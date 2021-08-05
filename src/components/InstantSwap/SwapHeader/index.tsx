import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "rebass";

import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import useTheme from "../../../hooks/useTheme";
import { useModalOpen, useToggleTrxSettingsMenu } from "../../../state/application/hooks";
import { ApplicationModal } from "../../../state/application/actions";
import { useUserSlippageTolerance, useUserTransactionTTL } from "../../../state/user/hooks";
import { AutoColumn } from "../../Column";
import TransactionSettings from "../../TransactionSettings";
import * as Styled from "./styleds";

const SwapHeader = () => {
	const node = useRef();
	const { t } = useTranslation();
	const theme = useTheme();
	const open = useModalOpen(ApplicationModal.TRXSETTINGS);
	const toggle = useToggleTrxSettingsMenu();

	const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
	const [ttl, setTtl] = useUserTransactionTTL();

	useOnClickOutside(node, open ? toggle : undefined);

	return (
		<div className="d-flex align-items-center justify-content-between mb-3">
			<Styled.Title>{t("convert")}</Styled.Title>
			{/* @ts-ignore */}
			<Styled.Menu ref={node}>
				<Styled.MenuButton onClick={toggle} id="open-settings-dialog-button">
					<Styled.MenuIcon />
				</Styled.MenuButton>
				{open && (
					<Styled.MenuFlyout>
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
					</Styled.MenuFlyout>
				)}
			</Styled.Menu>
		</div>
	);
};

export default SwapHeader;

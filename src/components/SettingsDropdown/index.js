import { useContext, useRef } from "react";
import { ThemeContext } from "styled-components";
import { Text } from "rebass";

import { useModalOpen, useToggleSettingsMenu } from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/actions";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { AutoColumn } from "../Column";
import ThemeToggler from "../ThemeToggler";
import { StyledMenuIcon, StyledMenu, MenuFlyout, StyledMenuButton, ThemeContainer, ItemWrap } from "./styles";
import CurrencyDropdown from "../HeaderDropdown/CurrencyDropdown";

const SettingsDropdown = () => {
	const node = useRef();
	const open = useModalOpen(ApplicationModal.SETTINGS);
	const toggle = useToggleSettingsMenu();

	const theme = useContext(ThemeContext);

	useOnClickOutside(node, open ? toggle : undefined);

	return (
		<StyledMenu ref={node}>
			<StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
				<StyledMenuIcon />
			</StyledMenuButton>
			{open && (
				<MenuFlyout>
					<AutoColumn gap="md" style={{ padding: "1rem" }}>
						<Text fontWeight={600} fontSize={14} color={theme.text1 + "80"}>
							Settings
						</Text>
						<ItemWrap>
							<ThemeContainer>
								<ThemeToggler />
							</ThemeContainer>
							<CurrencyDropdown />
						</ItemWrap>
					</AutoColumn>
				</MenuFlyout>
			)}
		</StyledMenu>
	);
};

export default SettingsDropdown;

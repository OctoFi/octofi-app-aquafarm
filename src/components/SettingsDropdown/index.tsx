import { useContext, useRef } from "react";
import { ThemeContext } from "styled-components";
import { Text } from "rebass";
import { Settings } from "react-feather";

import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { useModalOpen, useToggleSettingsMenu } from "../../state/application/hooks";
import { ApplicationModal } from "../../state/application/actions";
import { AutoColumn } from "../Column";
import CurrencyDropdown from "../CurrencyDropdown";
import ThemeToggler from "../ThemeToggler";
import * as Styled from "./styleds";

const SettingsDropdown = () => {
	const node = useRef();
	const open = useModalOpen(ApplicationModal.SETTINGS);
	const toggle = useToggleSettingsMenu();

	const theme = useContext(ThemeContext);

	useOnClickOutside(node, open ? toggle : undefined);

	return (
		// @ts-ignore
		<Styled.StyledMenu ref={node}>
			<Styled.StyledMenuButton onClick={toggle}>
				<Settings size={20} color={theme.text2} />
			</Styled.StyledMenuButton>
			{open && (
				<Styled.MenuFlyout>
					<AutoColumn gap="md" style={{ padding: "1rem" }}>
						<Text fontWeight={600} fontSize={14} color={theme.text1 + "80"}>
							Settings
						</Text>
						<Styled.ItemWrap>
							<Styled.ThemeContainer>
								<ThemeToggler />
							</Styled.ThemeContainer>
							<CurrencyDropdown />
						</Styled.ItemWrap>
					</AutoColumn>
				</Styled.MenuFlyout>
			)}
		</Styled.StyledMenu>
	);
};

export default SettingsDropdown;

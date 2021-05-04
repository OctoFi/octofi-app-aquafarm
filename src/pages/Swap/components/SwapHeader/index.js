import { useContext, useRef, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { Settings } from "react-feather";

import { useModalOpen, useToggleSettingsMenu } from "../../../../state/application/hooks";
import { ApplicationModal } from "../../../../state/application/actions";
import { useUserSlippageTolerance, useUserTransactionTTL } from "../../../../state/user/hooks";
import { useOnClickOutside } from "../../../../hooks/useOnClickOutside";
import { AutoColumn } from "../../../../components/Column";
import { Text } from "rebass";
import TransactionSettings from "../../../../components/TransactionSettings";

const StyledMenuIcon = styled(Settings)`
	height: 20px;
	width: 20px;

	> * {
		stroke: ${({ theme }) => theme.text2};
	}

	:hover {
		opacity: 0.7;
	}
`;

const StyledMenu = styled.div`
	margin-left: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	border: none;
	text-align: left;
`;

const MenuFlyout = styled.span`
	min-width: 20.125rem;
	background-color: ${({ theme }) => theme.bg2};
	box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
		0px 24px 32px rgba(0, 0, 0, 0.01);
	border: 1px solid ${({ theme }) => theme.text4};
	border-radius: 12px;
	display: flex;
	flex-direction: column;
	font-size: 1rem;
	position: absolute;
	top: 3rem;
	right: 0rem;
	z-index: 100;

	${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};
`;

const StyledMenuButton = styled.button`
	position: relative;
	width: 100%;
	height: 100%;
	border: none;
	background-color: transparent;
	margin: 0;
	padding: 0;
	height: 35px;

	padding: 0.15rem 0.5rem;
	border-radius: 0.5rem;

	:hover,
	:focus {
		cursor: pointer;
		outline: none;
	}

	svg {
		margin-top: 2px;
	}
`;

const SwapHeader = (props) => {
	const node = useRef();
	const open = useModalOpen(ApplicationModal.SETTINGS);
	const toggle = useToggleSettingsMenu();

	const theme = useContext(ThemeContext);
	const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();

	const [ttl, setTtl] = useUserTransactionTTL();

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
	);
};

export default SwapHeader;

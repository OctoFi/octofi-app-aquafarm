import { useTranslation } from "react-i18next";
import { X } from "react-feather";
import { LinkStyledButton } from "../../theme";
import styled from "styled-components";

const DisconnectButton = styled(LinkStyledButton)`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	gap: 0.5rem;
	color: ${({ theme }) => theme.text3};
	text-decoration: none;
	font-size: 1rem;
	line-height: 1.5;
	padding: 0;

	&:hover,
	&:active,
	&:focus {
		text-decoration: underline;
		color: ${({ theme }) => theme.text3};
	}
`;

export type DisconnectAccountProps = {
	onLogout: () => void;
};

const DisconnectAccount = ({ onLogout }: DisconnectAccountProps) => {
	const { t } = useTranslation();

	return (
		<DisconnectButton onClick={onLogout}>
			<X size={20} />
			<span>{t("menu.disconnect")}</span>
		</DisconnectButton>
	);
};

export default DisconnectAccount;

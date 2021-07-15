import { PropsWithChildren } from "react";
import { CheckCircle, Copy } from "react-feather";
import useCopyClipboard from "../../hooks/useCopyClipboard";
import useTheme from "../../hooks/useTheme";
import { LinkStyledButton } from "../../theme";
import styled from "styled-components";

const CopyButton = styled(LinkStyledButton)<{ color?: string }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	gap: 0.5rem;
	color: ${({ theme, color }) => color || theme.text3};
	text-decoration: none;
	font-size: 1rem;
	line-height: 1.5;
	padding: 0;

	&:hover,
	&:active,
	&:focus {
		text-decoration: underline;
		color: ${({ theme, color }) => color || theme.text3};
	}
`;

export type CopyHelperProps = {
	toCopy: string;
};

export default function CopyHelper({ toCopy, children }: PropsWithChildren<CopyHelperProps>) {
	const [isCopied, setCopied] = useCopyClipboard(1000);
	const theme = useTheme();

	return (
		<CopyButton onClick={() => setCopied(toCopy)} color={isCopied ? theme.success : theme.text3}>
			{isCopied ? (
				<>
					<CheckCircle size={20} />
					<span>Copied</span>
				</>
			) : (
				<>
					<Copy size={20} />
					{children}
				</>
			)}
		</CopyButton>
	);
}

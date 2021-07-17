import styled from "styled-components";

export const WalletTableWrap = styled.div`
	.table {
		border-collapse: collapse;
		border-spacing: 0 0;

		thead th {
			background-color: rgba(#202020, 0.1);
			color: #202020;
			font-size: 0.75rem;
			font-weight: 400;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-height: 56px;
			padding: 1rem 1.5rem !important;
			border: 0 !important;

			.dark-mode & {
				background-color: rgba(255, 255, 255, 0.1);
				color: #fff;
			}

			&:focus {
				outline: none;
			}

			&:first-child {
				border-top-left-radius: 12px;
				border-bottom-left-radius: 12px;
			}

			&:last-child {
				border-top-right-radius: 12px;
				border-bottom-right-radius: 12px;
				text-align: right;
			}
		}

		th,
		td {
			vertical-align: middle !important;
		}

		td {
			border-top: 0 !important;
			border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
			padding: 1.25rem 1.5rem;
		}

		tr:last-child td {
			border-bottom-width: 0;
		}
	}
`;

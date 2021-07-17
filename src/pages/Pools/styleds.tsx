import styled from "styled-components";

export const PoolsTableWrap = styled.div`
	.table {
		border-collapse: collapse;

		thead th {
			background-color: rgba(#202020, 0.1);
			color: #202020;
			font-size: 0.875rem;
			font-weight: 600;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 1rem;
			min-height: 56px;

			.dark-mode & {
				background-color: ${({ theme }) => theme.borderColor2};
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
			}
		}

		th,
		td {
			vertical-align: middle;

			&:first-child {
				padding-left: 2rem;
			}
		}

		td {
			border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
		}
	}
`;

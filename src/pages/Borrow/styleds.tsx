import styled from "styled-components";

export const BorrowTableWrap = styled.div`
	.table {
		border-collapse: separate;
		border-spacing: 0 0;

		thead th {
			background-color: ${({ theme }) => theme.borderColor2};
			color: ${({ theme }) => theme.text1};
			font-size: 0.75rem;
			font-weight: 400;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-height: 56px;
			padding: 1rem 1.5rem;

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

			&:last-child {
				text-align: left;
			}
		}

		td {
			border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
			padding: 1.25rem 1.5rem;
		}
	}
`;

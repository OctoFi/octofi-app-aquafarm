import styled from "styled-components";

export const AssetTableWrap = styled.div`
	.asset-table {
		border-collapse: separate;
		border-spacing: 0 6px;

		thead {
			th {
				color: rgba(#202020, 0.5);
				text-transform: uppercase;
				font-weight: 700;
				padding-top: 0;
				padding-bottom: 0;

				.dark-mode & {
					color: rgba($title, 0.5);
				}

				@media (max-width: 767px) {
					font-weight: 500;
					font-size: 0.75rem;
				}
			}
		}

		th,
		td {
			vertical-align: middle;

			&:first-child {
				border-top-left-radius: 12px;
				border-bottom-left-radius: 12px;

				@media (max-width: 767px) {
					padding-left: 0;
				}
			}
			&:last-child {
				border-top-right-radius: 12px;
				border-bottom-right-radius: 12px;

				@media (max-width: 767px) {
					padding-right: 0;
				}
			}
		}

		td {
			@media (max-width: 768px) {
				font-weight: 500;
				font-size: 0.875rem;
			}
		}
	}

	.asset-table--sm {
		th {
			font-size: 0.875rem;
		}
	}

	.asset-table--lg {
		th {
			font-size: 1.125rem;
		}
	}
`;

export const LogoContainer = styled.div`
	max-width: 32px;
	max-height: 32px;
	height: 32px;
	width: 32px;

	@media (max-width: 1199px) {
		max-width: 24px;
		max-height: 24px;
		height: 24px;
		width: 24px;
	}
`;

export const CustomText = styled.span<{ size: string }>`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: ${({ size }) =>
		size === "sm" ? "0.75rem" : size === "md" ? ".875rem" : size === "lg" ? "1rem" : ".875rem"};

	@media (min-width: 1200px) {
		font-weight: 700;
		font-size: ${({ size }) =>
			size === "sm" ? "0.75rem" : size === "md" ? "1rem" : size === "lg" ? "1.25rem" : "1rem"};
	}
`;

export const Title = styled.span<{ size: string }>`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: ${({ size }) =>
		size === "sm" ? "0.75rem" : size === "md" ? ".875rem" : size === "lg" ? "1rem" : ".875rem"};
	margin-left: 0.875rem;

	@media (min-width: 1200px) {
		font-weight: 700;
		font-size: ${({ size }) =>
			size === "sm" ? "0.75rem" : size === "md" ? "1rem" : size === "lg" ? "1.25rem" : "1rem"};
		margin-left: 1.25rem;
	}
`;

import React from "react";
import { Jazzicon } from "@ukstv/jazzicon-react";
import styled from "styled-components";
import { _numeral } from "../../lib/utils";

export const ModifiedJazzicon = styled(Jazzicon)`
	width: 24px;
	height: 24px;
	margin-right: 10px;

	@media (min-width: 768px) {
		width: 32px;
		height: 32px;
		margin-right: 15px;
	}
`;
const Wrapper = styled.tr`
	padding: 10px 0;
	position: relative;
	transition: 0.3s ease all;
	margin-bottom: 0.625rem;

	td {
		height: 40px;
		&:last-child {
			text-align: right;
		}
	}

	@media (min-width: 768px) {
		background-color: ${({ theme }) => theme.modalBG};

		td {
			border-top: 1px solid ${({ theme }) => theme.text3};
			border-bottom: 1px solid ${({ theme }) => theme.text3};
			height: 50px;

			&:first-child {
				border-left: 1px solid ${({ theme }) => theme.text3};
				border-top-left-radius: 18px;
				border-bottom-left-radius: 18px;
				padding-left: 30px;
			}

			&:last-child {
				border-right: 1px solid ${({ theme }) => theme.text3};
				border-top-right-radius: 18px;
				padding-right: 30px;
				border-bottom-right-radius: 18px;
				max-width: 80px;
				text-align: left;
			}
		}

		&:hover {
			background-color: ${({ theme }) => theme.bg1};
			border-color: ${({ theme }) => theme.text3};
		}
	}
`;

const Text = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 500;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;
const Address = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 400;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const voteItem = (props) => {
	return (
		<Wrapper>
			<td>
				<div className="d-flex align-items-center">
					<div className={"d-none d-lg-block"}>
						<ModifiedJazzicon address={props.address} />
					</div>
					<Address>
						{props.address.slice(0, 6)}...{props.address.slice(-4)}
					</Address>
				</div>
			</td>
			<td>
				<Text className={"d-none d-lg-flex"}>{props.vote}</Text>
			</td>
			<td>
				<Text>
					{_numeral(props.score)} {props.symbol}
				</Text>
			</td>
		</Wrapper>
	);
};

export default voteItem;

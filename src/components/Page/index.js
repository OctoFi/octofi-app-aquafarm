import styled from "styled-components";

import Header from "../Header";
import Footer from "../Footer";
import { useEffect } from "react";
import { withRouter } from "react-router";
import { useActiveWeb3React } from "../../hooks";
import WrongNetwork from "../WrongNetwork";

const PageContainer = styled.div`
	background-color: ${({ hasBg, theme }) => (hasBg ? theme.modalBG : "transparent")};
	padding-top: 136px;

	@media (min-width: 768px) {
		background-color: transparent;
	}
`;

const PageContent = styled.div``;

const Title = styled.h1`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin-top: 0;

	@media (min-width: 768px) {
		font-size: 2.5rem;
	}
`;

const Page = (props) => {
	const { chainId } = useActiveWeb3React();

	const notNetworkSensitive = props?.notNetworkSensitive || false;

	useEffect(() => {
		document.body.scrollTo(0, 0);
	}, []);

	return (
		<div>
			<Header />
			<PageContainer hasBg={props.hasBg} className="page container-lg">
				<PageContent>
					{props.title && <Title>{props.title}</Title>}
					{notNetworkSensitive ? (
						props.children
					) : !chainId || chainId === 1 ? (
						props.children
					) : (
						<WrongNetwork />
					)}
				</PageContent>
				<Footer />
			</PageContainer>
		</div>
	);
};

export default withRouter(Page);

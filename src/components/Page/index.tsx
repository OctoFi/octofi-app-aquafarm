import { PropsWithChildren, useEffect } from "react";
import { routes } from "../../constants/appbarRoutes";
import { useActiveWeb3React } from "../../hooks";
import AppBar from "../AppBar";
import Header from "../Header";
import Footer from "../Footer";
import WrongNetwork from "../WrongNetwork";
import { PageWrap, PageContent, PageContainer, Title } from "./styleds";

export type PageProps = {
	title?: string;
	fluid?: boolean;
	networkSensitive?: boolean;
};

const Page = ({ title, fluid = false, networkSensitive = false, children }: PropsWithChildren<PageProps>) => {
	const { chainId } = useActiveWeb3React();

	useEffect(() => {
		document.body.scrollTo(0, 0);
	}, []);

	return (
		<PageWrap>
			<Header />
			<PageContent>
				<PageContainer className={`page ${fluid ? "container-fluid" : "container-lg"}`}>
					<div>
						{title && <Title>{title}</Title>}
						{networkSensitive ? !chainId || chainId === 1 ? children : <WrongNetwork /> : children}
					</div>
				</PageContainer>
				<Footer />
			</PageContent>

			<div className="d-block d-lg-none">
				<AppBar routes={routes} />
			</div>
		</PageWrap>
	);
};

export default Page;

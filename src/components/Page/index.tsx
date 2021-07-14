import { PropsWithChildren, useEffect } from "react";
import { useActiveWeb3React } from "../../hooks";
import Header from "../Header";
import Footer from "../Footer";
import WrongNetwork from "../WrongNetwork";
import { PageContainer, Title } from "./styleds";

export type PageProps = {
	title?: string;
	fluid?: boolean;
	networkSensitive?: boolean;
	hasBg?: boolean;
};

const Page = ({
	title,
	fluid = false,
	networkSensitive = false,
	hasBg = false,
	children,
}: PropsWithChildren<PageProps>) => {
	const { chainId } = useActiveWeb3React();

	useEffect(() => {
		document.body.scrollTo(0, 0);
	}, []);

	return (
		<div>
			<Header />
			<PageContainer hasBg={hasBg} className={`page ${fluid ? "container-fluid" : "container-lg"}`}>
				<div>
					{title && <Title>{title}</Title>}
					{networkSensitive ? !chainId || chainId === 1 ? children : <WrongNetwork /> : children}
				</div>
			</PageContainer>
			<Footer />
		</div>
	);
};

export default Page;

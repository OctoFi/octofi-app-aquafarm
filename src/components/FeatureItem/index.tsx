import { PropsWithChildren } from "react";
import FeatureIcon from "./icon";
import * as Styled from "./styleds";

export type FeatureItemProps = {
	href?: string;
	iconName: any;
	title?: string;
	description?: any;
	desc?: any;
};

const FeatureItem = ({
	href = "#",
	iconName,
	title,
	description,
	desc,
	children,
}: PropsWithChildren<FeatureItemProps>) => {
	return (
		<Styled.Feature href={href} target="_blank" rel="noreferrer noopener">
			<Styled.Wrapper className="feature__wrapper mb-4 mb-lg-0">
				<Styled.Icon className={"feature__icon"}>
					<FeatureIcon name={iconName} />
				</Styled.Icon>
				<Styled.Title>{title}</Styled.Title>
				<Styled.Desc>{children || description || desc}</Styled.Desc>
			</Styled.Wrapper>
		</Styled.Feature>
	);
};

export default FeatureItem;

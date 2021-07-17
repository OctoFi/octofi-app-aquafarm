import { Card } from "react-bootstrap";
import styled from "styled-components";

const { Header, Body } = Card;

export const CustomCard = styled(Card)`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	margin-bottom: ${({ margin, marginBottom }) =>
		marginBottom ? `${marginBottom}px` : margin ? `${margin}px` : "20px"};
	margin-top: ${({ margin, marginTop }) => (marginTop ? `${marginTop}px` : margin ? `${margin}px` : "0")};
	border-radius: 12px;
	border: 1px solid ${({ theme }) => theme.borderColor2};
`;

export const CustomHeader = styled(Header)`
	border-bottom-color: ${({ theme }) => theme.text3};
	background-color: transparent;
	padding: 20px;

	@media (min-width: 768px) {
		padding: ${({ table }) => (table ? "30px 60px" : "30px")};
	}
`;

export const CustomBody = styled(Body)`
	padding: 20px;
	background-color: transparent;

	@media (min-width: 768px) {
		padding: ${({ table }) => (table ? "18px 48px" : "30px")};
	}
`;

export const CustomTitle = styled.h4`
	margin: 0;
	font-weight: bold;
	color: ${({ theme }) => theme.text1};
	font-size: 1.25rem;
`;

const Comp = (props) => {
	return (
		<CustomCard {...props}>
			{props.header && (
				<CustomHeader table={props.table}>
					{props.title && <CustomTitle>{props.title}</CustomTitle>}
					{props.header}
				</CustomHeader>
			)}
			<CustomBody table={props.table}>{props.children || props.body}</CustomBody>
		</CustomCard>
	);
};
export const ResponsiveCard = (props) => {
	return (
		<CustomCard {...props}>
			{props.header && (
				<CustomHeader table={props.table}>
					{props.title && <CustomTitle>{props.title}</CustomTitle>}
					{props.header}
				</CustomHeader>
			)}
			<CustomBody table={props.table}>{props.children || props.body}</CustomBody>
		</CustomCard>
	);
};

export default Comp;

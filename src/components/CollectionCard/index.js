import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { useMemo } from "react";
import SVG from "react-inlinesvg";

import Img from "../UI/Img";

const Wrapper = styled.button`
	display: flex;
	align-items: center;
	background-color: transparent;
	border: none;
	cursor: pointer;

	&:hover,
	&:active,
	&:focus {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}
`;

const LogoContainer = styled.div`
	width: 32px;
	height: 32px;
	min-width: 32px;
	border-radius: 32px;
	margin-right: 20px;
	position: relative;
	overflow: hidden;
	box-shadow: 0 0 0 1pt ${({ theme }) => theme.text1};
`;

const Logo = styled(Img)`
	width: 100%;
	height: 100%;
`;

const Name = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;
	text-align: left;
`;

const Overlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${({ theme }) => `${theme.bg1}cd`};
	opacity: ${({ isSelected }) => (isSelected ? 1 : 0)};
	transition: 0.3s ease all;
	z-index: 2;
`;

const CollectionCard = (props) => {
	const loading = props.collection.loading;

	const skeletons = useMemo(() => {
		const result = [];
		if (loading) {
			const count = Math.floor(Math.random() * 2 + 1);
			for (let i = 0; i < count; i++) {
				const width = Math.floor(Math.random() * (count > 2 ? 50 : 70) + 30);
				result.push(<Skeleton width={width} className={"mr-2"} />);
			}
		}

		return result;
	}, [loading]);

	return (
		<Wrapper onClick={props.clickHandler}>
			{loading ? (
				<>
					<LogoContainer>
						<Skeleton width={"100%"} height={"100%"} circle />
					</LogoContainer>
					{skeletons}
				</>
			) : (
				<>
					<LogoContainer>
						<Overlay isSelected={props.isSelected}>
							<SVG src={require("../../assets/images/close.svg").default} width={10} height={10} />
						</Overlay>
						<Logo src={props.collection.image_url} alt={props.collection.name} />
					</LogoContainer>
					<Name>{props.collection.name}</Name>
				</>
			)}
		</Wrapper>
	);
};

export default CollectionCard;

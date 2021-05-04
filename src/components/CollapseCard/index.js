import React, { useContext, useRef, useState, useCallback } from "react";
import ArrowRightIcon from "../Icons/ArrowRight";
import styled, { ThemeContext } from "styled-components";

const Wrapper = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 18px;
	margin-bottom: 15px;
	overflow: hidden;
	transition: all 0.6s ease;
	will-change: transform, height, border-color, box-shadow;

	@media (min-width: 768px) {
		margin-bottom: 1.25rem;
	}
`;

const Header = styled.div`
	padding: 15px 26px 15px 20px;
	max-height: 60px;
	height: 60px;
	cursor: pointer;
	transition: 0.3s ease background-color;
	position: relative;
	background-color: ${({ theme }) => theme.modalBG};
`;

const HeaderShowMore = styled.div`
	width: 10px;
	height: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: ${({ show }) => (show ? "rotate(90deg)" : "rotate(0deg)")};
	transition: 0.4s ease all;
	will-change: background-color, transform;
	margin-left: 16px;

	@media (max-width: 991px) {
		position: absolute;
		top: 26px;
		right: 26px;
		transform: ${({ show }) => (show ? "rotate(-90deg)" : "rotate(90deg)")};
	}
`;

const HeaderTitle = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};
`;

const CollapseView = styled.div`
	overflow: hidden;
	max-height: ${({ height }) => `${height}px` || 0};
	display: flex;
	flex-direction: column;

	transition: 0.4s ease all;
`;

const Content = styled.div`
	border-top: 1px solid ${({ theme }) => theme.text3};
	padding: 20px;
`;

const CollapseCard = (props) => {
	const [show, setShow] = useState(false);
	const [height, setHeight] = useState(0);

	const header = useRef(null);
	const content = useRef(null);
	const theme = useContext(ThemeContext);

	const showCollapse = useCallback(() => {
		if (content.current) {
			const contentRect = content.current.getBoundingClientRect();

			if (show) {
				setHeight(0);
			} else {
				setHeight(contentRect.height);
			}

			setShow((show) => !show);
		}
	}, [show, content]);

	return (
		<Wrapper show={show}>
			<Header
				className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between"
				ref={header}
				onClick={showCollapse}
				show={show}
			>
				<HeaderTitle>{props.title}</HeaderTitle>
				<HeaderShowMore show={show}>
					<ArrowRightIcon size={16} fill={theme.text1} />
				</HeaderShowMore>
			</Header>
			<CollapseView height={height}>
				<Content ref={content}>{props.children}</Content>
			</CollapseView>
		</Wrapper>
	);
};

export default CollapseCard;

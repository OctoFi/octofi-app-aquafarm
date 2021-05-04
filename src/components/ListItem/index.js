import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
	position: relative;
	transition: 0.3s ease all;
	width: 100%;

	&:not(:last-child) {
		margin-bottom: 1.875rem;
	}
`;

const InfoDesc = styled.span`
	font-size: 0.75rem;
	font-weight: 400;
	margin: 0;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-size: 0.875rem;
		font-weight: 500;
	}
`;

const listItem = (props) => {
	return (
		<Wrapper className="d-flex align-items-center justify-content-between">
			<InfoDesc>{props.title}</InfoDesc>
			<div>{props.children}</div>
		</Wrapper>
	);
};

export default listItem;

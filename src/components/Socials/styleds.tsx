import styled from "styled-components";

export const SocialList = styled.ul`
	list-style: none;
	padding: 0;
	display: flex;
	align-items: center;
	width: 100%;
	margin: 0;
`;

export const SocialItem = styled.li`
	padding-bottom: 10px;

	&:not(:last-child) {
		margin-right: 2.25rem;
	}
`;

export const SocialLink = styled.a`
	color: ${({ theme }) => theme.text1};
`;

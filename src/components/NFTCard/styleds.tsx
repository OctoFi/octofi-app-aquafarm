import styled from "styled-components";
import Img from "../UI/Img";

export const Wrapper = styled.div`
	min-width: 240px;
	max-width: 320px;
	text-decoration: none;
	display: flex;
	flex-direction: column;
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 12px;
	padding: 10px;
	height: calc(100% - 20px);
	margin-bottom: 20px;
	border: 1px solid ${({ theme }) => theme.text4};

	@media (max-width: 991px) {
		padding: 20px;
	}

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}

	> div {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
`;

export const ImageContainer = styled.div`
	width: 100%;
	padding-top: 100%;
	position: relative;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	margin-bottom: 15px;

	@media (max-width: 991px) {
		margin-bottom: 20px;
	}
`;

export const Image = styled(Img)`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	border-radius: 12px;
`;

export const Content = styled.div`
	padding: 0 5px;
	display: flex;
	flex-direction: column;

	@media (max-width: 991px) {
		padding: 0;
	}
`;

export const CollectionText = styled.span`
	display: block;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;
	margin-bottom: 5px;

	@media (max-width: 991px) {
		margin-bottom: 11px;
	}
`;

export const Name = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;
	line-height: 19px;
	margin-bottom: 1rem;

	@media (max-width: 991px) {
		font-size: 1.125rem;
		line-height: 22px;
	}
`;

export const DetailsList = styled.ul`
	margin: 0 0 20px;
	padding: 0;
	display: flex;
	flex-direction: column;
	list-style: none;

	@media (max-width: 991px) {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 40px;
	}
`;

export const DetailsItem = styled.li`
	display: flex;
	align-items: center;

	&:not(:last-child) {
		margin-bottom: 15px;

		@media (max-width: 991px) {
			margin-bottom: 0;
		}
	}
`;

export const DetailsText = styled.span<{ bold?: boolean }>`
	display: block;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: ${({ bold }) => (bold ? 700 : 400)};
	padding-left: 11px;

	@media (max-width: 991px) {
		padding-left: 6px;
	}
`;

export const StyledButton = styled.button`
	height: 40px;
	border-radius: 12px;
	font-size: 0.875rem;
`;

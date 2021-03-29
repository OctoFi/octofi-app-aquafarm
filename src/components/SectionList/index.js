import React from "react";
import styled from "styled-components";

const Section = styled.div`
	margin-bottom: 5.625rem;
	display: flex;
	flex-direction: column;

	@media (max-width: 767px) {
		margin-bottom: 2.75rem;
	}

	&:first-child {
		@media (max-width: 767px) {
			margin-top: 10px;
		}
	}
`;

const SectionHeader = styled.div`
	margin-bottom: 1.25rem;
	display: flex;
	align-items: center;
	justify-content: space-between;

	@media (max-width: 767px) {
		align-items: flex-start;
	}
`;

const SectionHeaderInner = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
`;

const SectionTitle = styled.h4`
	font-weight: 500;
	font-size: 1rem;
	margin-bottom: 0.625rem;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-weight: 700;
		font-size: 1.25rem;
	}
`;

const SectionSubTitle = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text3};

	@media (min-width: 768px) {
		color: ${({ theme }) => theme.text1};
		font-size: 1rem;
	}
`;

const SectionBody = styled.div`
	display: flex;
	flex-direction: ${({ direction }) => direction};
	margin-bottom: 0.5rem;
`;

const SectionList = (props) => {
	return props.sections.map((section) => {
		return (
			<Section>
				<SectionHeader>
					<SectionHeaderInner>
						<SectionTitle>{section.title}</SectionTitle>
						{section.description && <SectionSubTitle>{section.description}</SectionSubTitle>}
					</SectionHeaderInner>
					{section.headerAction || null}
				</SectionHeader>

				<SectionBody direction={props.direction || "column"}>{section.content}</SectionBody>
			</Section>
		);
	});
};

export default SectionList;

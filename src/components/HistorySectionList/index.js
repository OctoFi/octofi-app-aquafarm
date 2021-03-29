import React from "react";
import styled from "styled-components";

const Section = styled.div`
	display: flex;
	flex-direction: column;

	@media (min-width: 768px) {
		margin-bottom: 0.125rem;
	}
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.25rem;
`;

const SectionHeaderInner = styled.div`
	display: flex;
	flex-direction: column;
`;

const SectionTitle = styled.h4`
	font-weight: 700;
	font-size: 1.25rem;
	margin: 0;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 1rem;
	}
`;

const SectionSubTitle = styled.span`
	font-weight: 400;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
`;

const SectionBody = styled.div`
	margin-bottom: 5px;
	display: flex;
	flex-direction: ${({ direction }) => direction};

	@media (min-width: 768px) {
		margin-bottom: 0.5rem;
	}
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

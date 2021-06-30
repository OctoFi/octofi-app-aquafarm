import * as Styled from "./styleds";

export type SectionListProps = {
	sections: Array<Section>;
	direction: string;
};

export type Section = {
	title: string;
	description: string;
	headerAction?: any;
	content: any;
};

const SectionList = ({ sections, direction }: SectionListProps) => {
	return sections.map((section, index) => {
		return (
			<Styled.Section key={`section-list-${index}`}>
				<Styled.SectionHeader>
					<Styled.SectionHeaderInner>
						<Styled.SectionTitle>{section.title}</Styled.SectionTitle>
						{section.description && <Styled.SectionSubTitle>{section.description}</Styled.SectionSubTitle>}
					</Styled.SectionHeaderInner>
					{section.headerAction || null}
				</Styled.SectionHeader>

				<Styled.SectionBody direction={direction || "column"} className="mr-n4">
					{section.content}
				</Styled.SectionBody>
			</Styled.Section>
		);
	});
};

export default SectionList;

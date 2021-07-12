import * as Styled from "./styleds";

export type HistorySection = {
	title: string;
	content: JSX.Element[];
	description?: string;
	headerAction?: any;
};

export type HistorySectionListProps = {
	sections: Array<any>;
};

const HistorySectionList = ({ sections }: HistorySectionListProps) => {
	return (
		<>
			{sections.map((section, index) => {
				return (
					<section key={`${section.title}-${index}`}>
						<Styled.SectionHeader>
							<div>
								<Styled.SectionTitle>{section.title}</Styled.SectionTitle>
								{section.description && (
									<Styled.SectionSubTitle>{section.description}</Styled.SectionSubTitle>
								)}
							</div>
							{section.headerAction || null}
						</Styled.SectionHeader>

						<div>{section.content}</div>
					</section>
				);
			})}
		</>
	);
};

export default HistorySectionList;

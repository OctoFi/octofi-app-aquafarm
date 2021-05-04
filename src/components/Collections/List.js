import styled from "styled-components";
import { lighten } from "polished";
import CollectionCard from "../CollectionCard";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	max-height: 600px;
	overflow-x: hidden;
	overflow-y: auto;

	/* width */
	::-webkit-scrollbar {
		width: 3px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		box-shadow: none;
		background-color: transparent;
		border-radius: 10px;
		padding: 0 6px;
		margin: 0 6px;
		border-right: 1px solid ${({ theme }) => theme.text1};
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.text1};
		border-radius: 10px;
		width: 4px !important;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: ${({ theme }) => lighten(0.08, theme.text1)};
	}
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
`;

const CollectionsList = styled.ul`
	margin: 0;
	padding: 0;
`;
const CollectionsItem = styled.li`
	&:not(:last-child) {
		margin-bottom: 20px;
	}
`;

const List = (props) => {
	return (
		<Container>
			<Content>
				<CollectionsList>
					{props.loading
						? [...Array(8)].map((item, i) => {
								return (
									<CollectionsItem key={`collections-loading-${i}`}>
										<CollectionCard collection={{ loading: true }} />
									</CollectionsItem>
								);
						  })
						: props.collections.map((item, i) => {
								return (
									<CollectionsItem
										key={`collections-${i}`}
										onClick={props.clickHandler.bind(this, item)}
									>
										<CollectionCard collection={item} isSelected={item.slug === props.selected} />
									</CollectionsItem>
								);
						  })}
				</CollectionsList>
			</Content>
		</Container>
	);
};

export default List;

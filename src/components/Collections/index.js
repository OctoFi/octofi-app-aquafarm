import styled from "styled-components";
import React, { useEffect, useState, useMemo, useCallback } from "react";

import { InputGroupFormControl as FormControl, InputGroupPrepend, InputGroup, InputGroupText } from "../Form";
import SearchIcon from "../../assets/images/search.svg";
import List from "./List";
import OpenSeaApi from "../../http/opensea";
import { useActiveWeb3React } from "../../hooks";
import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 20px;

	.input-group-text {
		padding-left: 1.25rem;
	}
`;

const api = new OpenSeaApi();

const Collections = (props) => {
	const { account } = useActiveWeb3React();
	const [loading, setLoading] = useState(true);
	const [collections, setCollections] = useState([]);
	const [query, setQuery] = useState("");
	const { t } = useTranslation();

	const filteredCollections = useMemo(() => {
		if (query === "") {
			return collections;
		} else {
			const lowerQuery = query.toLowerCase();
			return collections.filter((c) => JSON.stringify({ n: c.name, d: c.description }).includes(lowerQuery));
		}
	}, [collections, query]);

	const changeQueryHandler = useCallback((e) => {
		setQuery(e.target.value);
	}, []);

	useEffect(() => {
		setLoading(true);
		api.get("collections", {
			params: {
				limit: 300,
			},
		})
			.then((response) => {
				setLoading(false);
				if (response.data.hasOwnProperty("collections")) {
					setCollections(response.data.collections);
				}
			})
			.catch((e) => {
				setLoading(false);
			});
	}, [account]);

	return (
		<Wrapper>
			<CustomInputGroup className={"w-auto"} bg={"darker"}>
				<InputGroupPrepend>
					<InputGroupText>
						<SVG src={SearchIcon} />
					</InputGroupText>
				</InputGroupPrepend>
				<FormControl id="PoolsSearch" placeholder={t("search")} onChange={changeQueryHandler} />
			</CustomInputGroup>

			<List
				collections={filteredCollections}
				loading={loading}
				clickHandler={props.onChangeCollection}
				selected={props.selected}
			/>
		</Wrapper>
	);
};

export default Collections;

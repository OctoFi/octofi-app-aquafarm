import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import _ from "lodash";

import SearchIcon from "../../assets/images/search.svg";
import { fetchSpaces } from "../../state/governance/actions";
import Page from "../../components/Page";
import {
	InputGroup,
	InputGroupText,
	InputGroupPrepend,
	InputGroupFormControl as FormControl,
} from "../../components/Form";
import SnapshotSpaceList from "../../components/SnapshotSpaceList";
import * as Styled from "./styleds";

const Governance = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const [search, setSearch] = useState("");
	const { loading, spaces } = useSelector((state) => state.governance);
	const [transformedSpaces, setTransformedSpaces] = useState([]);

	useEffect(() => {
		dispatch(fetchSpaces());
	}, [dispatch]);

	useEffect(() => {
		const pinnedSpaces = process.env.REACT_APP_GOVERNANCE_PINNED.split(",").map((space) => space.trim());
		const list = Object.keys(spaces).map((key) => {
			const space = spaces[key];
			return {
				space,
				pinned: !!pinnedSpaces.includes(key),
				key,
			};
		});

		const newSpaces = _.orderBy(list, ["pinned"], ["desc"]).filter((space) =>
			JSON.stringify(space).toLowerCase().includes(search.toLowerCase())
		);
		setTransformedSpaces(newSpaces);
	}, [search, spaces]);

	const searchHandler = (e) => {
		setSearch(e.target.value);
	};

	return (
		<Page title={t("governance.title")} networkSensitive={false}>
			<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-end justify-content-between mb-4">
				<Styled.Title className="card-title">{t("governance.spaces")}</Styled.Title>
				<InputGroup className={"w-auto"}>
					<InputGroupPrepend>
						<InputGroupText>
							<SVG src={SearchIcon} />
						</InputGroupText>
					</InputGroupPrepend>
					<FormControl id="inlineFormInputGroup" placeholder={t("search")} onChange={searchHandler} />
				</InputGroup>
			</div>

			<SnapshotSpaceList items={transformedSpaces} loading={loading} />
		</Page>
	);
};

export default Governance;

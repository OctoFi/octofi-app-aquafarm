import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import SVG from "react-inlinesvg";
import SearchIcon from "../../assets/images/search.svg";
import { InputGroupFormControl as FormControl, InputGroup, InputGroupPrepend, InputGroupText } from "../Form";
import Modal from "../Modal";
import Column from "../Column";
import CurrencyList from "./CurrencyList";
import styled from "styled-components";

const HeaderContainer = styled.div`
	padding: 30px 30px 20px;
	border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
`;

export default function SwapSelectModal({ isOpen, onDismiss, onCurrencySelect, selectedCurrency, currencies, type }) {
	const [searchQuery, setSearchQuery] = useState("");
	const fixedList = useRef();
	const inputRef = useRef();

	const filteredTokens = useMemo(() => {
		return currencies.filter((token) => JSON.stringify(token).toLowerCase().includes(searchQuery) || !searchQuery);
	}, [currencies, searchQuery]);

	const titles = useMemo(() => {
		return currencies
			.map((token, index) => {
				return {
					...token,
					index,
				};
			})
			.filter((token) => token.type === "title");
	}, [currencies]);

	useEffect(() => {
		if (isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	const handleInput = useCallback((event) => {
		const input = event.target.value;
		setSearchQuery(input.toLowerCase());
		fixedList.current.scrollTo(0);
	}, []);

	const handleCurrencySelect = useCallback(
		(currency) => {
			onCurrencySelect(currency, type);
			onDismiss();
		},
		[onDismiss, onCurrencySelect]
	);

	return (
		<Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={80} maxWidth={420}>
			<Column className="p-0" style={{ width: "100%", flex: "1 1", minHeight: "100px" }}>
				<HeaderContainer>
					<InputGroup className="w-auto" bg="darker">
						<InputGroupPrepend>
							<InputGroupText>
								<SVG src={SearchIcon} />
							</InputGroupText>
						</InputGroupPrepend>
						<FormControl
							id="token-search-input"
							placeholder={"Search"}
							value={searchQuery}
							ref={inputRef}
							onChange={handleInput}
						/>
					</InputGroup>
				</HeaderContainer>

				<div style={{ flex: "1" }}>
					<AutoSizer disableWidth>
						{({ height }) => (
							<CurrencyList
								height={height}
								currencies={filteredTokens}
								onCurrencySelect={handleCurrencySelect}
								selectedCurrency={selectedCurrency}
								fixedListRef={fixedList}
							/>
						)}
					</AutoSizer>
				</div>
			</Column>
		</Modal>
	);
}

import { useState, useCallback } from "react";
import styled from "styled-components";
import { TYPE, CloseIcon } from "../../theme";
import Card from "../Card";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed, AutoRow } from "../Row";
import { ArrowLeft, AlertTriangle } from "react-feather";
import useTheme from "../../hooks/useTheme";
import { transparentize } from "polished";
import { ButtonPrimary } from "../Button";
import { ExternalLink } from "../../theme";
import ListLogo from "../ListLogo";
import { PaddedColumn, Checkbox, TextDot } from "./styleds";
import { TokenList } from "@uniswap/token-lists";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import { useFetchListCallback } from "../../hooks/useFetchListCallback";
import { removeList, enableList } from "../../state/lists/actions";
import { CurrencyModalView } from "./CurrencySearchModal";
import { useAllLists } from "../../state/lists/hooks";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	position: relative;
	width: 100%;
	overflow: auto;
`;

const SectionBreak = styled.div`
	height: 1px;
	width: 100%;
	background-color: ${({ theme }) => theme.bg1};
`;

interface ImportProps {
	listURL: string;
	list: TokenList;
	onDismiss: () => void;
	setModalView: (view: CurrencyModalView) => void;
}

export function ImportList({ listURL, list, setModalView, onDismiss }: ImportProps) {
	const theme = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { t } = useTranslation();

	// user must accept
	const [confirmed, setConfirmed] = useState(false);

	const lists = useAllLists();
	const fetchList = useFetchListCallback();

	// monitor is list is loading
	// @ts-ignore
	const adding = Boolean(lists[listURL]?.loadingRequestId);
	const [addError, setAddError] = useState<string | null>(null);

	const handleAddList = useCallback(() => {
		if (adding) return;
		setAddError(null);
		fetchList(listURL)
			.then(() => {
				// turn list on
				dispatch(enableList(listURL));
				// go back to lists
				setModalView(CurrencyModalView.manage);
			})
			.catch((error) => {
				setAddError(error.message);
				dispatch(removeList(listURL));
			});
	}, [adding, dispatch, fetchList, listURL, setModalView]);

	return (
		<Wrapper>
			<PaddedColumn gap="14px" style={{ width: "100%", flex: "1 1" }}>
				<RowBetween>
					<ArrowLeft style={{ cursor: "pointer" }} onClick={() => setModalView(CurrencyModalView.manage)} />
					<TYPE.MediumHeader>{t("importList.import")}</TYPE.MediumHeader>
					<CloseIcon onClick={onDismiss} />
				</RowBetween>
			</PaddedColumn>
			<SectionBreak />
			<PaddedColumn gap="md">
				<AutoColumn gap="md">
					<Card backgroundColor={theme.bg1} padding="12px 20px">
						<RowBetween>
							<RowFixed>
								{list.logoURI && <ListLogo logoURI={list.logoURI} size="40px" />}
								<AutoColumn gap="sm" style={{ marginLeft: "20px" }}>
									<RowFixed>
										<TYPE.Body fontWeight={600} mr="6px">
											{list.name}
										</TYPE.Body>
										<TextDot />
										<TYPE.Main fontSize={"16px"} ml="6px">
											{list.tokens.length} {t("importList.token")}
										</TYPE.Main>
									</RowFixed>
									<ExternalLink href={`https://tokenlists.org/token-list?url=${listURL}`}>
										<TYPE.Main fontSize={"12px"} color={theme.blue1}>
											{listURL}
										</TYPE.Main>
									</ExternalLink>
								</AutoColumn>
							</RowFixed>
						</RowBetween>
					</Card>
					<Card style={{ backgroundColor: transparentize(0.8, theme.red1) }}>
						<AutoColumn justify="center" style={{ textAlign: "center", gap: "16px", marginBottom: "12px" }}>
							<AlertTriangle stroke={theme.red1} size={32} />
							<TYPE.Body fontWeight={500} fontSize={20} color={theme.red1}>
								{t("importToken.tradeRisk")}
							</TYPE.Body>
						</AutoColumn>

						<AutoColumn style={{ textAlign: "center", gap: "16px", marginBottom: "12px" }}>
							<TYPE.Body fontWeight={500} color={theme.red1}>
								{t("importList.listWarning")}
							</TYPE.Body>
							<TYPE.Body fontWeight={600} color={theme.red1}>
								{t("importToken.cantSell")}
							</TYPE.Body>
						</AutoColumn>
						<AutoRow
							justify="center"
							style={{ cursor: "pointer" }}
							onClick={() => setConfirmed(!confirmed)}
						>
							<Checkbox
								name="confirmed"
								type="checkbox"
								checked={confirmed}
								onChange={() => setConfirmed(!confirmed)}
							/>
							<TYPE.Body ml="10px" fontSize="16px" color={theme.red1} fontWeight={500}>
								{t("importToken.understand")}
							</TYPE.Body>
						</AutoRow>
					</Card>

					<ButtonPrimary
						disabled={!confirmed}
						altDisabledStyle={true}
						borderRadius="20px"
						padding="10px 1rem"
						onClick={handleAddList}
					>
						{t("import")}
					</ButtonPrimary>
					{addError ? (
						<TYPE.Error title={addError} style={{ textOverflow: "ellipsis", overflow: "hidden" }} error>
							{addError}
						</TYPE.Error>
					) : null}
				</AutoColumn>
			</PaddedColumn>
		</Wrapper>
	);
}

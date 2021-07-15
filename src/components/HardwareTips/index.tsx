import { useTranslation } from "react-i18next";
import { Modal } from "../Modal/bootstrap";
import TokenLogo from "../CrossTokenLogo";
import PathIcon from "../../assets/images/icon/path.svg";
import * as Styled from "./styleds";

export type HardwareTipsProps = {
	HardwareTipOpen: any;
	closeHardwareTip: () => void;
	error: boolean;
	txnsInfo: any;
	onSure: () => void;
	isSelfBtn: boolean;
	title: any;
	tipInfo: any;
	coin: any;
};

const HardwareTips = ({
	HardwareTipOpen,
	closeHardwareTip = () => {},
	error = false,
	txnsInfo,
	onSure = () => {},
	isSelfBtn = false,
	title,
	tipInfo,
	coin,
}: HardwareTipsProps) => {
	const { t } = useTranslation();

	return (
		<Modal show={HardwareTipOpen} onHide={closeHardwareTip} centered={true}>
			<Modal.Header>
				<Modal.Title>{error ? "Error" : title ? title : t("ConfirmTransaction")}</Modal.Title>
			</Modal.Header>

			<Styled.Wrapper>
				<Styled.UpperSection>
					<Styled.HeaderRow>
						<Styled.HoverText>{error ? "Error" : title ? title : "Confirm Transaction"}</Styled.HoverText>
					</Styled.HeaderRow>

					<Styled.ContentWrapper>
						<Styled.LogoBox>
							{coin ? <TokenLogo address={coin} size={"24px"} /> : <img src={PathIcon} alt={"logo"} />}
						</Styled.LogoBox>

						{error ? (
							<Styled.ErrorTip>
								<h3>Sign Failed!</h3>
								<p>
									Please make sure your Ledger unlocked, open Ethereum app with contract data setting
									allowed
								</p>
							</Styled.ErrorTip>
						) : (
							<Styled.ConfirmContent>
								{txnsInfo && <Styled.TxnsInfoText>{txnsInfo}</Styled.TxnsInfoText>}

								<Styled.ConfirmText>
									{tipInfo ? tipInfo : "Please confirm transaction on your Ledger"}
								</Styled.ConfirmText>
							</Styled.ConfirmContent>
						)}

						{isSelfBtn && (
							<Styled.ButtonConfirm onClick={onSure} variant={"primary"}>
								Confirm
							</Styled.ButtonConfirm>
						)}
					</Styled.ContentWrapper>
				</Styled.UpperSection>
			</Styled.Wrapper>
		</Modal>
	);
};

export default HardwareTips;

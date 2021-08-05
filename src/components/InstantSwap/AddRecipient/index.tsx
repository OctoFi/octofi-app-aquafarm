import { Button } from "react-bootstrap";
import { Download, Minus, Plus } from "react-feather";
import { useTranslation } from "react-i18next";
import useTheme from "../../../hooks/useTheme";
import AddressInputPanel from "../../AddressInputPanel";
import * as Styled from "./styleds";

export type AddRecipientProps = {
	recipient: any;
	onChangeRecipient?: any;
};

const AddRecipient = ({ recipient, onChangeRecipient }: AddRecipientProps) => {
	const theme = useTheme();
	const { t } = useTranslation();

	return (
		<>
			{recipient === null ? (
				<div className="d-flex justify-content-end">
					<Button variant="link" className="d-flex align-items-center" onClick={() => onChangeRecipient("")}>
						<Plus size={16} className="mr-1" /> {t("addSend")} ({t("optional")})
					</Button>
				</div>
			) : (
				<>
					<div className="d-flex justify-content-start">
						<Styled.SwitchCol>
							<Download size={18} color={theme.text2} />
						</Styled.SwitchCol>
					</div>

					<AddressInputPanel value={recipient} onChange={onChangeRecipient} />

					<div className="d-flex justify-content-end">
						<Button
							variant="link"
							className="d-flex align-items-center"
							onClick={() => onChangeRecipient(null)}
						>
							<Minus size={16} className="mr-1" /> {t("removeSend")}
						</Button>
					</div>
				</>
			)}
		</>
	);
};

export default AddRecipient;

import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import moment from "moment";
import { CloseIcon } from "../../../theme";
import { Modal } from "../../Modal/bootstrap";
import { RowBetween } from "../../Row";

// TODO: create interface for Order
export type QrModalProps = {
	order: any;
	orderType: string;
	show: boolean;
	onClose: () => void;
	darkMode?: boolean;
};

const QrModal = ({ order, orderType, show, onClose, darkMode }: QrModalProps) => {
	const { t } = useTranslation();

	return (
		<Modal show={show} centered onHide={onClose} size={"lg"}>
			<Modal.Body className={"d-flex flex-column"} style={{ minHeight: 480 }}>
				<RowBetween>
					<div />
					<CloseIcon onClick={onClose} />
				</RowBetween>
				{orderType === "simpleSwap" || orderType === "stealthex" ? (
					<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
						<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
							{t("instantSwap.submitted")}
						</h4>
						<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
							<QRCode
								value={order.address_from || ""}
								fgColor={darkMode ? "#fff" : "#202020"}
								bgColor={"transparent"}
							/>
						</div>
						<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
							<span className="font-size-large mb-2 d-block">
								{t("instantSwap.sendCrypto", {
									amount: order.amount_from,
									crypto: order.currency_from?.toUpperCase(),
								})}
							</span>
							<span className="opacity-50 font-size-sm">{t("instantSwap.exchangeDescription")}</span>
						</div>

						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">ADDRESS</span>
							<span className=" font-weight-bold">{order.address_from}</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column"}>
							<span className="opacity-50 mb-2">Order ID</span>
							<span>{order.id}</span>
						</div>
					</div>
				) : orderType === "changeNow" ? (
					<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
						<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
							{t("instantSwap.submitted")}
						</h4>
						<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
							<QRCode
								value={order.payinAddress || ""}
								fgColor={darkMode ? "#fff" : "#202020"}
								bgColor={"transparent"}
							/>
						</div>
						<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
							<span className="font-size-large mb-2 d-block">
								{t("instantSwap.sendCrypto", {
									amount: order.fromAmount,
									crypto: order.fromCurrency?.toUpperCase(),
								})}
							</span>
							<span className="opacity-50 font-size-sm">{t("instantSwap.exchangeDescription")}</span>
						</div>

						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">ADDRESS</span>
							<span className=" font-weight-bold">{order.payinAddress}</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">Order ID</span>
							<span>{order.id}</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column"}>
							<span className="opacity-50 mb-2">Recipient Address</span>
							<span>{order.settleAddress?.address}</span>
						</div>
					</div>
				) : orderType === "sideShift" ? (
					<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
						<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
							{t("instantSwap.submitted")}
						</h4>
						<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
							<QRCode
								value={order.depositAddress?.address || ""}
								fgColor={darkMode ? "#fff" : "#202020"}
								bgColor={"transparent"}
							/>
						</div>
						<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
							<span className="font-size-large mb-2 d-block">
								{t("instantSwap.sendCrypto", {
									amount: order.fromAmount,
									crypto: order.depositMethodId?.toUpperCase(),
								})}
							</span>
							<span className="opacity-50 font-size-sm">{t("instantSwap.exchangeDescription")}</span>
						</div>

						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">ADDRESS</span>
							<span className=" font-weight-bold">{order.depositAddress?.address}</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">EXPIRATION DATE</span>
							<span className=" font-weight-bold">
								{moment(order.expiresAtISO).format("YYYY-MM-DD HH:mm")}
							</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column mb-3"}>
							<span className="opacity-50 mb-2">Order ID</span>
							<span>{order.orderId}</span>
						</div>
						<div className={"align-self-stretch d-flex flex-column"}>
							<span className="opacity-50 mb-2">Recipient Address</span>
							<span>{order.settleAddress?.address}</span>
						</div>
					</div>
				) : null}
			</Modal.Body>
		</Modal>
	);
};

export default QrModal;

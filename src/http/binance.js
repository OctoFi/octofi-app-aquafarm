const BASE_URL = "wss://stream.binance.com/";

export default class BinanceSocket {
	constructor(onOpen, onClose, onMessage, onError) {
		this.ws = new WebSocket(`${BASE_URL}stream`);

		this.ws.addEventListener("open", onOpen);

		this.ws.addEventListener("message", onMessage);

		this.ws.addEventListener("close", onClose);

		this.ws.addEventListener("error", onError);

		return this.ws;
	}
}

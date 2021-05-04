const DEFAULT_WS_ENDPOINT = "wss://api.dydx.exchange/v1/ws";
const DEFAULT_TIMEOUT_MS = 10000;

const IncomingMessageType = {
	ERROR: "error",
	CONNECTED: "connected",
	SUBSCRIBED: "subscribed",
	CHANNEL_DATA: "channel_data",
};

export default class DydxSocket {
	constructor(timeout = DEFAULT_TIMEOUT_MS, endpoint = DEFAULT_WS_ENDPOINT) {
		this.timeout = timeout;
		this.endpoint = endpoint;
		this.ws = undefined;
	}

	async connect({ onClose = () => null, onError = () => null }) {
		if (this.ws) {
			throw new Error("Websocket already connected");
		}

		return this.reconnect({
			onError,
			onClose,
		});
	}

	async reconnect({ onClose = () => null, onError = () => null }) {
		this.subscribedCallbacks = {};
		this.listeners = {};

		this.ws = new WebSocket(this.endpoint);

		this.ws.addEventListener("close", () => {
			this.ws = null;
			this.subscribedCallbacks = {};
			this.listeners = {};
			onClose();
		});

		this.ws.addEventListener("message", (message) => {
			let parsed;
			try {
				parsed = JSON.parse(message.data);
			} catch (error) {
				onError(new Error(`Failed to parse websocket message: ${message.data}`));
				return;
			}

			if (!Object.values(IncomingMessageType).includes(parsed.type)) {
				onError(new Error(`Incomming message contained no type: ${message.data}`));
				return;
			}

			if (parsed.type === IncomingMessageType.ERROR) {
				onError(new Error(`Websocket threw error: ${parsed.message}`));
				return;
			}

			if (parsed.type === IncomingMessageType.SUBSCRIBED) {
				const subscribedMessage = parsed;

				if (this.subscribedCallbacks[subscribedMessage.channel]) {
					if (this.subscribedCallbacks[subscribedMessage.channel][subscribedMessage.id]) {
						const callback = this.subscribedCallbacks[subscribedMessage.channel][subscribedMessage.id];
						delete this.subscribedCallbacks[subscribedMessage.channel][subscribedMessage.id];

						callback(subscribedMessage.contents);
					}
				}

				return;
			}

			if (parsed.type === IncomingMessageType.CHANNEL_DATA) {
				const subscribedMessage = parsed;

				if (this.listeners[subscribedMessage.channel]) {
					const callback = this.listeners[subscribedMessage.channel][subscribedMessage.id];
					if (callback) {
						callback(subscribedMessage.contents);
					}
				}

				return;
			}
		});

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error("Websocket connection timeout")), this.timeout);
			this.ws.addEventListener("open", () => {
				clearTimeout(timeout);
				resolve();
			});
		});
	}

	async close() {
		this.ws.close();
	}

	async watchOrderbook({ market, onUpdates }) {
		if (!this.ws) {
			throw new Error("Websocket connection not open");
		}

		const subscribeMessage = {
			type: "subscribe",
			channel: "orderbook",
			id: market,
		};

		if (this.subscribedCallbacks[subscribeMessage.channel]) {
			if (
				this.subscribedCallbacks[subscribeMessage.channel][subscribeMessage.id] ||
				this.listeners[subscribeMessage.channel][subscribeMessage.id]
			) {
				throw new Error(`Already watching orderbook market ${market}`);
			}
		}
		this.listeners[subscribeMessage.channel] = {};
		this.listeners[subscribeMessage.channel][subscribeMessage.id] = (contents) => {
			onUpdates(contents.updates);
		};

		const initialResponsePromise = new Promise((resolve, reject) => {
			const timeout = setTimeout(
				() => reject(new Error(`Websocket orderbook subscribe timeout: ${market}`)),
				this.timeout
			);

			if (!this.subscribedCallbacks[subscribeMessage.channel]) {
				this.subscribedCallbacks[subscribeMessage.channel] = {};
			}

			this.subscribedCallbacks[subscribeMessage.channel][subscribeMessage.id] = (contents) => {
				clearTimeout(timeout);
				resolve(contents);
			};
		});

		this.ws.send(JSON.stringify(subscribeMessage));

		return initialResponsePromise;
	}
}

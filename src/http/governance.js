import axios from "axios";

export default class Governance {
	constructor(baseURL = `${process.env.REACT_APP_HUB_URL}/api/`) {
		this.baseURL = baseURL;

		this.request = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
		});
	}

	get(type, payload) {
		switch (type) {
			case "spaces": {
				return this.fetchSpaces(payload);
			}
			case "singleSpace": {
				return this.fetchSingleSpace(payload);
			}
			case "proposals": {
				return this.fetchProposals(payload);
			}
			case "singleProposal": {
				return this.fetchSingleProposal(payload);
			}
			case "votes": {
				return this.fetchVotes(payload);
			}
			default: {
				return new Promise((resolve) => {
					resolve(null);
				});
			}
		}
	}

	fetchSpaces() {
		return this.request
			.get("spaces")
			.then((response) => response.data)
			.catch((error) => error);
	}

	fetchSingleSpace({ id }) {
		return this.request
			.get(`spaces/${id}`)
			.then((response) => response.data)
			.catch((error) => error);
	}

	fetchProposals({ id }) {
		return this.request
			.get(`${id}/proposals`)
			.then((response) => response.data)
			.catch((error) => error);
	}

	fetchSingleProposal({ id, address }) {
		return this.request
			.get(`${id}/proposals`)
			.then((response) => response.data[address])
			.catch((error) => error);
	}

	fetchVotes({ id, address }) {
		return this.request
			.get(`${id}/proposal/${address}`)
			.then((response) => response.data)
			.catch((error) => error);
	}

	sendMessage(msg) {
		return this.request
			.post(`message`, msg, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			})
			.then((response) => response.data)
			.catch((error) => error);
	}
}

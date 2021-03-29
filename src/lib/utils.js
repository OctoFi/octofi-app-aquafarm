import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import numeral from "numeral";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { abi as multicallAbi } from "../constants/abis/Multicall.json";
import _strategies from "./strategies";
import { getContract } from "../utils";

export const MULTICALL = {
	1: "0xeefba1e63905ef1d7acba5a8513c70307c1ce441",
	4: "0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821",
	5: "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e",
	6: "0x53c43764255c17bd724f74c4ef150724ac50a3ed",
	42: "0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a",
	56: "0x1ee38d535d541c55c9dae27b12edf090c608e6fb",
	82: "0x579De77CAEd0614e3b158cb738fcD5131B9719Ae",
	97: "0x8b54247c6BAe96A6ccAFa468ebae96c4D7445e46",
	100: "0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a",
	wanchain: "0xba5934ab3056fca1fa458d30fbb3810c3eb5145f",
};

export const SNAPSHOT_SUBGRAPH_URL = {
	1: "https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot",
	4: "https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot-rinkeby",
	42: "https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot-kovan",
};

export async function call(provider, abi, call, options) {
	const contract = new Contract(call[0], abi, provider);
	try {
		const params = call[2] || [];
		return await contract[call[1]](...params, options || {});
	} catch (e) {
		return Promise.reject(e);
	}
}

export async function multicall(network, provider, abi, calls, options) {
	const itf = new Interface(abi);
	const multi = getContract(MULTICALL[network], multicallAbi, provider);
	try {
		try {
			const [, res] = await multi.aggregate(
				calls.map((call) => [call[0].toLowerCase(), itf.encodeFunctionData(call[1], call[2])]),
				options || {}
			);
			return res.map((call, i) => itf.decodeFunctionResult(calls[i][1], call));
		} catch (e) {
			return [];
		}
	} catch (e) {
		return Promise.reject(e);
	}
}

export async function subgraphRequest(url, query) {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) }),
	});
	const { data } = await res.json();
	return data || {};
}

export async function ipfsGet(gateway, ipfsHash, protocolType = "ipfs") {
	const url = `https://${gateway}/${protocolType}/${ipfsHash}`;
	return fetch(url).then((res) => res.json());
}

export async function getScores(space, strategies, network, provider, addresses, snapshot = "latest") {
	return await Promise.all(
		strategies.map((strategy) =>
			_strategies[strategy.name](space, network, provider, addresses, strategy.params, snapshot)
		)
	);
}

export function jsonParse(input, fallback) {
	if (typeof input !== "string") {
		return fallback || {};
	}
	try {
		return JSON.parse(input);
	} catch (err) {
		return fallback || {};
	}
}

export function _numeral(number, format = "(0.[00]a)") {
	return numeral(number).format(format);
}

export function formatProposal(base) {
	const proposal = JSON.parse(JSON.stringify(base));
	proposal.msg = jsonParse(proposal.msg, proposal.msg);

	// v0.1.0
	if (proposal.msg.version === "0.1.0") {
		proposal.msg.payload.start = 1595088000;
		proposal.msg.payload.end = 1595174400;
		proposal.msg.payload.snapshot = 10484400;
		proposal.bpt_voting_disabled = "1";
	}

	// v0.1.1
	if (proposal.msg.version === "0.1.0" || proposal.msg.version === "0.1.1") {
		proposal.msg.payload.metadata = {};
	}

	return proposal;
}

export function formatProposals(proposals) {
	return Object.fromEntries(Object.entries(proposals).map((proposal) => [proposal[0], formatProposal(proposal[1])]));
}

export default {
	call,
	multicall,
	subgraphRequest,
	ipfsGet,
	getScores,
};

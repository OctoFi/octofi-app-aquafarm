import { useMemo } from "react";

export const useLogo = (space, symbolIndex) => {
	return useMemo(() => {
		const file = symbolIndex ? (symbolIndex === "space" ? "space" : `logo${symbolIndex}`) : "logo";
		return `https://raw.githubusercontent.com/bonustrack/snapshot-spaces/master/spaces/${space}/${file}.png`;
	}, [space, symbolIndex]);
};

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

export function formatProposal(proposal) {
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

export function shorten(str, key) {
	if (!str) return str;
	let limit;
	if (key === "symbol") limit = 6;
	if (key === "name") limit = 64;
	if (key === "choice") limit = 12;
	if (limit) return str.length > limit ? `${str.slice(0, limit).trim()}...` : str;
	return shorten(str);
}

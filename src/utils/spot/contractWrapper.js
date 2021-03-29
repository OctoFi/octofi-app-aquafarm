import { ContractWrappers } from "@0x/contract-wrappers";
import { CHAIN_ID } from "../../constants";

let contractWrappers;
export const getContractWrappers = async (library) => {
	if (!contractWrappers) {
		contractWrappers = new ContractWrappers(library, { chainId: CHAIN_ID });
	}
	return contractWrappers;
};

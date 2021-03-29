import { strategy as balancer } from "./balancer/index";
import { strategy as contractCall } from "./contract-call/index";
import { strategy as erc20BalanceOf } from "./erc20-balance-of/index";
import { strategy as erc20BalanceOfCoeff } from "./erc20-balance-of-coeff/index";
import { strategy as erc20BalanceOfFixedTotal } from "./erc20-balance-of-fixed-total/index";
import { strategy as erc20BalanceOfCv } from "./erc20-balance-of-cv/index";
import { strategy as erc20WithBalance } from "./erc20-with-balance/index";
import { strategy as erc20BalanceOfDelegation } from "./erc20-balance-of-delegation/index";
import { strategy as ethBalance } from "./eth-balance/index";
import { strategy as makerDsChief } from "./maker-ds-chief/index";
import { strategy as uni } from "./uni/index";
import { strategy as yearnVault } from "./yearn-vault/index";
import { strategy as moloch } from "./moloch/index";
import { strategy as uniswap } from "./uniswap/index";
import { strategy as pancake } from "./pancake/index";
import { strategy as synthetix } from "./synthetix/index";
import { strategy as ctoken } from "./ctoken/index";
import { strategy as cream } from "./cream/index";
import { strategy as esd } from "./esd/index";
import { strategy as stakedUniswap } from "./staked-uniswap/index";

export default {
	balancer,
	"contract-call": contractCall,
	"erc20-balance-of": erc20BalanceOf,
	"erc20-balance-of-fixed-total": erc20BalanceOfFixedTotal,
	"erc20-balance-of-cv": erc20BalanceOfCv,
	"erc20-balance-of-coeff": erc20BalanceOfCoeff,
	"erc20-with-balance": erc20WithBalance,
	"erc20-balance-of-delegation": erc20BalanceOfDelegation,
	"eth-balance": ethBalance,
	"maker-ds-chief": makerDsChief,
	uni,
	"yearn-vault": yearnVault,
	moloch,
	uniswap,
	pancake,
	synthetix,
	ctoken,
	cream,
	"staked-uniswap": stakedUniswap,
	esd,
};

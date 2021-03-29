import {useEffect, useMemo, useState} from "react";

import {presaleAddresses} from "../constants";
import PresaleFactoryABI from '../constants/abis/Presale/PresaleFactory.json';
import PresaleABI from '../constants/abis/Presale/Presale.json';
import {useContract} from "./useContract";
import {useMultipleContractSingleData, useSingleContractMultipleData} from "../state/multicall/hooks";
import {Interface} from "@ethersproject/abi";
import {useActiveWeb3React} from "./index";



export const usePresalesAddresses = () => {
    const [length, setLength] = useState(0)
    const [presales, setPresales] = useState([]);
    const factoryContract = useContract(presaleAddresses.factory, PresaleFactoryABI);

    const getPresalsesLength = async () => {
        try {
            const res = await factoryContract.presalesLength();
            setLength(res);
        } catch(e) {
            setLength(0);
        }
    }


    const transformedLength = Number(length?.toString() || 0);
    const args = useMemo(() => {
        return [...Array(transformedLength)].map((_, i) => [i])
    }, [transformedLength])
    const result = useSingleContractMultipleData(
        factoryContract,
        'presaleAtIndex',
        args
    )


    useEffect(() => {
        getPresalsesLength()
    }, [factoryContract])

    useEffect(
        () => {
            const pr = result?.map(res => res?.result?.[0]) || [];
            setPresales(pr);
        },
        [result]
    );

    return useMemo(() => {
        return presales
    }, [presales])
}

export const usePresalesDetails = () => {
    const presales = usePresalesAddresses();
    const presalesDetails = useMultipleContractSingleData(presales, new Interface(PresaleABI), 'PRESALE_INFO', []);

    return useMemo(() => {
        return presalesDetails?.map((item, _i) => {
            const res = item?.result;
            return {
                contractAddress: presales?.[_i],
                owner: res?.[0],
                token: res?.[1],
                baseToken: res?.[2],
                tokenPrice: res?.[3],
                spendLimit: res?.[4],
                amount: res?.[5],
                hardCap: res?.[6],
                softCap: res?.[7],
                liquidityPercent: res?.[8],
                listingPrice: res?.[9],
                startBlock: res?.[10],
                endBlock: res?.[11],
                lockPeriod: res?.[12],
                presaleInEth: res?.[13]

            }
        })
    }, [presalesDetails])
}

export const usePresalesStatus = () => {
    const presales = usePresalesAddresses();
    const presalesStatus = useMultipleContractSingleData(presales, new Interface(PresaleABI), 'STATUS', []);

    return useMemo(() => {
        return presalesStatus?.map(item => {
            const res = item?.result;
            return {
                whitelistOnly: res?.WHITELIST_ONLY,
                lpGenerationComplete: res?.LP_GENERATION_COMPLETE,
                forceFailed: res?.FORCE_FAILED,
                totalBaseCollected: res?.TOTAL_BASE_COLLECTED,
                totalTokensSold: res?.TOTAL_TOKENS_SOLD,
                totalTokensWithdrawn: res?.TOTAL_TOKENS_WITHDRAWN,
                totalBaseWithdrawn: res?.TOTAL_BASE_WITHDRAWN,
                roundOneLength: res?.ROUND1_LENGTH,
                buyersCount: res?.NUM_BUYERS

            }
        })
    }, [presalesStatus])
}


export const usePresalesState = () => {
    const presales = usePresalesAddresses();
    const presalesDetails = useMultipleContractSingleData(presales, new Interface(PresaleABI), 'presaleStatus', []);

    return useMemo(() => {
        return presalesDetails?.map(item => {
            const res = item?.result;
            return Number(res?.[0]?.toString() || 0);
        })
    }, [presalesDetails])
}

export const usePresales = () => {
    const presalesDetails = usePresalesDetails();
    const presalesStates = usePresalesState();
    const presalesStatus = usePresalesStatus();


    return useMemo(() => {
        return presalesDetails.map((item, i) => {
            return {
                ...item,
                state: presalesStates?.[i] || 0,
                status: {
                    ...(presalesStatus?.[i] || {})
                }
            }
        })
    }, [presalesDetails, presalesStates])
}

export const usePresaleState = (address) => {
    const contract = useContract(address, PresaleABI);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        if(!contract) {
            return;
        }
        contract.presaleStatus()
            .then(res => {
                setStatus(Number(res.toString()));
            })
            .catch(e => {
                console.log(e);
            })
    }, [contract, address])

    return useMemo(() => {
        return status;
    }, [status])
}

export const usePresaleStatus = (address) => {
    const contract = useContract(address, PresaleABI);
    const [presale, setPresale] = useState({});


    useEffect(() => {
        if(!contract) {
            return;
        }
        contract.STATUS()
            .then(res => {
                setPresale({
                    whitelistOnly: res?.WHITELIST_ONLY,
                    lpGenerationComplete: res?.LP_GENERATION_COMPLETE,
                    forceFailed: res?.FORCE_FAILED,
                    totalBaseCollected: res?.TOTAL_BASE_COLLECTED,
                    totalTokensSold: res?.TOTAL_TOKENS_SOLD,
                    totalTokensWithdrawn: res?.TOTAL_TOKENS_WITHDRAWN,
                    totalBaseWithdrawn: res?.TOTAL_BASE_WITHDRAWN,
                    roundOneLength: res?.ROUND1_LENGTH,
                    buyersCount: res?.NUM_BUYERS
                })
            })
            .catch(e => {
                console.log(e);
            })
    }, [contract, address])

    return useMemo(() => {
        return presale;
    }, [presale])
}

export const usePresale = (address) => {
    const contract = useContract(address, PresaleABI);
    const state = usePresaleState(address);
    const status = usePresaleStatus(address);
    const [presale, setPresale] = useState({});

    useEffect(() => {
        if(!contract) {
            setPresale({
                error: 'wrong_address'
            })
            return;
        }
        contract.PRESALE_INFO()
            .then(res => {
                setPresale({
                    contractAddress: address,
                    owner: res?.[0],
                    token: res?.[1],
                    baseToken: res?.[2],
                    tokenPrice: res?.[3],
                    spendLimit: res?.[4],
                    amount: res?.[5],
                    hardCap: res?.[6],
                    softCap: res?.[7],
                    liquidityPercent: res?.[8],
                    listingPrice: res?.[9],
                    startBlock: res?.[10],
                    endBlock: res?.[11],
                    lockPeriod: res?.[12],
                    presaleInEth: res?.[13]

                })
            })
            .catch(e => {
                console.log(e);
                setPresale({
                    error: 'wrong_address'
                })
            })
    }, [contract, address])

    return useMemo(() => {
        return {
            ...presale,
            status,
            state,
        };
    }, [presale, state, status]);
}


export const useAccountBuy = (address) => {
    const { account } = useActiveWeb3React();
    const contract = useContract(address, PresaleABI);
    const [buyState, setBuyState] = useState({});

    useEffect(() => {
        if(!contract) {
            setBuyState({
                error: 'wrong_address'
            })
            return;
        }
        contract.BUYERS(account)
            .then(res => {
                setBuyState({
                    ...res,
                })
            })
            .catch(err => {
                setBuyState({
                    error: 'wrong_address'
                })
            })
    }, [contract, address])

    return useMemo(() => {
        return buyState;
    }, [buyState]);
}

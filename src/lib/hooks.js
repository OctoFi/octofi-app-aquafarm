import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

import { injected } from './connections'

export function useEagerConnect() {
    const { activate, active } = useWeb3React()

    const [tried, setTried] = useState(false)

    useEffect(() => {
        injected.isAuthorized().then((isAuthorized) => {
            if (isAuthorized) {
                activate(injected, undefined, true).catch(() => {
                    setTried(true)
                })
            } else {
                setTried(true)
            }
        })
    }, []) // intentionally only running on mount (make sure it's only mounted once :))

    // if the connection worked, wait until we get confirmation of that to flip the flag
    useEffect(() => {
        if (!tried && active) {
            setTried(true)
        }
    }, [tried, active])

    return tried
}

export function useInactiveListener(suppress = false) {
    const { active, error, activate } = useWeb3React()

    useEffect(() => {
        const { ethereum } = window;
        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleConnect = () => {
                console.log("Handling 'connect' event")
                activate(injected)
            }
            const handleChainChanged = (chainId) => {
                console.log("Handling 'chainChanged' event with payload", chainId)
                activate(injected)
            }
            const handleAccountsChanged = (accounts) => {
                console.log("Handling 'accountsChanged' event with payload", accounts)
                if (accounts.length > 0) {
                    activate(injected)
                }
            }

            const handleDisconnect = () => {
                console.log("handle 'disconnect' event")
            }

            ethereum.on('connect', handleConnect)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)
            ethereum.on('disconnect', handleDisconnect);

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('connect', handleConnect)
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                    ethereum.removeListener('disconnect', handleDisconnect);
                }
            }
        }
    }, [active, error, suppress, activate])
}

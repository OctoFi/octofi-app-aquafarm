import styled from "styled-components";
import { Row, Col, Button as BS } from 'react-bootstrap';
import SVG from "react-inlinesvg";
import React, {useEffect, useMemo, useState} from "react";
import { Link } from 'react-router-dom';
import {useTranslation} from "react-i18next";

import TokenLogo from '../../components/CrossTokenLogo';
import getConfig from '../../config';
import Page from "../../components/Page";
import DefaultCard from '../../components/Card';
import {
	InputGroup,
	InputGroupFormControl as FormControl,
	InputGroupPrepend,
	InputGroupText
} from "../../components/Form";
import SearchIcon from "../../assets/images/search.svg";
import CurrencyText from "../../components/CurrencyText";
import {Table} from "./Table";
import {darken} from "polished";
import {useActiveWeb3React} from "../../hooks";
import {useAllBalances} from "../../contexts/Balances";
import {useAllTokenDetails} from "../../contexts/Tokens";
import {amountFormatter, formatEthBalance, formatNum, formatTokenBalance} from "../../utils/cross";
import BigNumber from "bignumber.js";
import {showData} from "../../utils/showData";
import {getPoolInfo} from "../../utils/crossBalance";

const config = getConfig();

const Button = styled(BS)`
  min-height: 48px;
  height: 48px;
  border-radius: 18px;
  font-weight: 500;
  font-size: 1rem;
  min-width: 105px;
  
  @media (max-width: 991px) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: .875rem;
    min-height: 40px;
    height: 40px;
    padding: 0;
    border-radius: 12px;
  }
`

const Title = styled.h1`
	margin: 0;
	font-size: 2.5rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	line-height: 3rem;

	
	@media (max-width: 1199px) {
		font-size: 2.25rem;
	}
	@media (max-width: 991px) {
		font-size: 2rem;
	  	margin-bottom: 0.5rem;
	}
	@media (max-width: 767px) {
		font-size: 1.5rem;
	}
`

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
	margin-top: 40px;
	
	@media(max-width: 991px) {
		margin-top: 10px;
	  	flex-direction: column;
	  	align-items: stretch;
	}
`

const Card = styled(DefaultCard)`
	& > .card-body {
		padding: 30px 30px 24px;
	  
	  	@media (max-width: 576px) {
		  	padding: 16px;
	    }
	}
`

const CellText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  display: block;
  line-height: 1.25rem;
  
  @media (max-width: 991px) {
    font-size: .875rem;
  }
  @media (max-width: 767px) {
    font-size: .75rem;
  }
`

const CurrencySymbol = styled(CellText)`
  margin-bottom: 5px;


  @media (max-width: 991px) {
    margin-bottom: 0;
  }
`

const CurrencyName = styled.span`
  font-size: .875rem;
  font-weight: 400;
  line-height: 1.125rem;
  color: ${({ theme }) => theme.text3};


  @media (max-width: 991px) {
    font-size: .75rem;
  }
  @media (max-width: 767px) {
    font-size: .625rem;
  }
`

const CoinContent = styled.div`
  margin-left: 45px;
  
  @media (max-width: 1199px) {
    margin-left: 24px;
  }
  
  @media (max-width: 991px) {
    margin-left: 0;
    margin-right: 24px;
  }
  
  @media (max-width: 991px) {
    margin-right: 16px;
  }
`

const ShowMoreButton = styled.button`
  background-color: transparent;
  padding: 8px 0;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.primary};
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.primary};
  display: inline-block;
  margin-top: 2rem;
  
  &:hover,
  &:focus,
  &:active {
    outline: none;
    text-decoration: none;
    box-shadow: none;
  }
  
  &:hover {
    color: ${({ theme }) => darken(0.1, theme.primary)};
    border-bottom-color: ${({ theme }) => darken(0.1, theme.primary)};
  }
`

function isBaseUSD (coin) {
	if (
		(coin === 'aUSDT' && config.symbol === 'FSN') ||
		(coin === 'anyUSDT' && config.symbol === 'FTM') ||
		(coin === 'HUSD' && config.symbol === 'HT') ||
		(coin === 'USDTB' && config.symbol === 'BNB') ||
		(coin === 'USDC' && config.symbol === 'ETH')
	) {
		return true
	} else if (coin === 'anyUSDT') {
		return true
	}
	return false
}

const CrossBalance = props => {
	const { account } = useActiveWeb3React();
	const allBalances = useAllBalances()
	const allTokens = useAllTokenDetails()
	const { t } = useTranslation()
	const [query, setQuery] = useState('');
	const [showFull, setShowFull] = useState(false);
	const [poolList, setPoolList] = useState([])
	const [poolObj, setPoolObj] = useState({})
	const [baseMarket, setBaseMarket] = useState()
	const [pagecount, setPagecount] = useState(0)

	const changeSearchInput = (e) => {
		setQuery(e.target.value);
	}

	const poolArr = useMemo(() => {
		const arr = []
		for (const obj in allTokens) {
			arr.push({
				token: obj,
				exchangeAddress: allTokens[obj].exchangeAddress,
				...allTokens[obj]
			})
		}
		return arr
	}, [allTokens])


	const totalCount = poolArr.length
	const poolInfoObj = {}

	function formatData (res) {
		let arr = []
		let baseAccountBalance = new BigNumber(0)
		let rwArr = []
		for (let obj of res) {
			console.log(obj);
			obj.pecent = amountFormatter(obj.pecent, 18, Math.min(config.keepDec, obj.decimals))
			obj.balance = amountFormatter(obj.balance, obj.decimals, Math.min(config.keepDec, obj.decimals))
			if (obj.Basebalance) {
				baseAccountBalance = baseAccountBalance.plus(obj.Basebalance)
			}
			// if (obj.exchangeETHBalance) {
			//   baseAllBalance = baseAllBalance.add(obj.exchangeETHBalance)
			// }
			if (isBaseUSD(obj.symbol)) {
				console.log(obj.market, 18, Math.min(config.keepDec, obj.decimals))
				setBaseMarket(Number(amountFormatter( obj.market, 18, Math.min(config.keepDec, obj.decimals) )))
			}
			poolInfoObj[obj.symbol] = obj
			arr.push(obj)
			if (obj.exchangeETHBalance && obj.exchangeTokenBalancem && obj.market) {
				rwArr.push({
					coin: obj.symbol,
					market: obj.market ? obj.market.toString() : 0,
					baseAmount: obj.exchangeETHBalance ? obj.exchangeETHBalance.toString() : 0,
					tokenAmount: obj.exchangeTokenBalancem ? obj.exchangeTokenBalancem.toString() : 0
				})
			}
		}
		if (arr[0].symbol === config.symbol) {
			arr[0].Basebalance = baseAccountBalance
			poolInfoObj[config.symbol].Basebalance = baseAccountBalance
		}
		setPoolObj(poolInfoObj)
		return arr
	}


	async function getData (account) {
		let arr = []
		for (let i = 0; i <= totalCount; i++) {
			const resArr = poolArr

			const result = await getPoolInfo(resArr, account)
			arr.push(...formatData(result))
			setPoolList(arr)
		}
	}

	useEffect(() => {
		if (poolArr.length > 0) {
			if (poolList.length <= 0) {
				setPoolList(poolArr)
			}
			getData(account)
		}
	}, [poolArr, account])

	function getPrice(market, coin) {
		if (isBaseUSD(coin)) {
			return '1'
		}
		if (!market) return '-'
		let mt1 = Number(amountFormatter( market, 18 , config.keepDec))
		if (!mt1) return '0'
		return formatNum((baseMarket / mt1), config.keepDec)
	}

	const columns = useMemo(() => {
		return [
			{
				dataField: 'coin',
				text: t('cross.coin'),
				formatter: (cell, row, rowIndex) => {
					return (
						<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
							<TokenLogo
								size={'32px'}
								address={row?.symbol}
							/>
							<CoinContent className="d-flex flex-column align-items-stretch justify-content-center">
								<CurrencySymbol>{showData(row?.symbol?.toUpperCase())}</CurrencySymbol>
								<CurrencyName>{showData(row?.name)}</CurrencyName>
							</CoinContent>
						</div>
					)
				}
			},
			{
				dataField: 'price',
				text: t('cross.price'),
				formatter: (cell, row, rowIndex) => {
					return (
						<CellText>
							<CurrencyText>{showData(row?.price)}</CurrencyText>
						</CellText>
					)
				}
			},
			{
				dataField: 'balance',
				text: t('cross.balance'),
				formatter: (cell, row, rowIndex) => {
					return (
						<CellText>{account ? showData(row?.balance) : '-'}</CellText>
					)
				}
			},
			{
				dataField: 'totalBalance',
				text: t('cross.totalBalance'),
				formatter: (cell, row, rowIndex) => {
					return (
						<CellText>{account ? showData(row?.balance) : '-'}</CellText>
					)
				}
			},
			{
				dataField: 'action',
				text: t('cross.action'),
				formatter: (cell, row, rowIndex) => {
					return (
						<Button as={Link} className={'btn btn-light-primary'} to={`/cross/anyswap?inputCurrency=${row?.address}`}>Swap</Button>
					)
				},
				isAction: true
			},
		]
	}, [])

	function getMyAccount() {
		if(!account) return {};

		const myAccount = account ? allBalances[account] : ''

		let tokenList = Object.keys(allTokens).map(k => {
			let balance = '-'
			let price = '-'
			let tvl = 0

			if (k === config.symbol && myAccount && myAccount[k] && myAccount[k].value) {
				balance = formatEthBalance(new BigNumber(myAccount[k].value))
			} else if (myAccount && myAccount[k] && myAccount[k].value) {
				balance = formatTokenBalance(new BigNumber(myAccount[k].value), allTokens[k].decimals)
			}
			if (poolObj[allTokens[k].symbol] && baseMarket) {
				if (allTokens[k].symbol === config.symbol) {
					price = formatNum(baseMarket, config.keepDec)
				} else {
					price = getPrice(poolObj[allTokens[k].symbol].market, allTokens[k].symbol)
				}
				if (!isNaN(balance) && !isNaN(price)) {
					tvl = Number(balance) * Number(price)
				}
			}
			return {
				name: allTokens[k].name,
				symbol: allTokens[k].symbol,
				address: k,
				balance: balance,
				isSwitch: allTokens[k].isSwitch,
				price: price,
				tvl: tvl
			}
		})

		tokenList.sort((a, b) => {
			if (!isNaN(a.tvl) && !isNaN(b.tvl) && Number(a.tvl) > Number(b.tvl)) {
				return -1
			}
		})

		if (config.isChangeDashboard) {
			let ANYItem = {}
			for (let i = 0,len = tokenList.length; i < len; i++) {
				if (tokenList[i].symbol === 'ANY') {
					ANYItem = tokenList[i]
					tokenList.splice(i, 1)
					break
				}
			}
			tokenList.unshift(ANYItem)
		}

		return tokenList.length > 0 ? tokenList.filter(item => {
			return !query
				|| item.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
				|| item.symbol.toLowerCase().indexOf(query.toLowerCase()) !== -1
				|| item.address.toLowerCase().indexOf(query.toLowerCase()) !== -1;

		}) : []
	}

	const data = getMyAccount();
	return (
		<Page notNetworkSensitive={true}>
			<Row>
				<Col xs={12}>
					<Header>
						<Title>Crosstopus Balances</Title>
						<InputGroup className={"w-auto"}>
							<InputGroupPrepend>
								<InputGroupText>
									<SVG src={SearchIcon} />
								</InputGroupText>
							</InputGroupPrepend>
							<FormControl
								value={query}
								id="CrossBalanceSearch"
								placeholder={t("search")}
								onChange={changeSearchInput}
							/>
						</InputGroup>
					</Header>
				</Col>
				<Col xs={12}>
					<Card>
						<div className="d-flex flex-column align-items-stretch">
							<Table
								columns={columns}
								entities={!Array.isArray(data) ? [] : !showFull ? data?.slice(0, 3) : data}
							/>
							{!showFull && (
								<div className="align-self-center text-center">
									<ShowMoreButton onClick={setShowFull.bind(this, true)}>See More</ShowMoreButton>
								</div>
							)}
						</div>
					</Card>
				</Col>
			</Row>
		</Page>
	)
}

export default CrossBalance;
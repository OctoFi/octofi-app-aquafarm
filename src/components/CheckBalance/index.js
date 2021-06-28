import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loading from "../Loading";
import { ResponsiveCard } from "../Card";
import { useActiveWeb3React } from "../../hooks";
import { BalanceToken } from "../../constants";
import { useMemoTokenBalance } from "../../hooks/checkBalance";
import { haveEnoughBalance } from "../../state/account/actions";

const CheckBalance = (props) => {
	const { account } = useActiveWeb3React();
	const [loadingBalance, setLoadingBalance] = useState(true);
	const dispatch = useDispatch();
	const enoughCoinBalance = useSelector((state) => state.account.enoughCoinBalance);

	const TokenBalance = useMemoTokenBalance(account, BalanceToken);

	useEffect(() => {
		if (account) {
			setLoadingBalance(true);
			if (TokenBalance) {
				const value = TokenBalance.toSignificant(6);
				if (Number(value) < 1) {
					dispatch(haveEnoughBalance(false));
				} else {
					dispatch(haveEnoughBalance(true));
				}
				setLoadingBalance(false);
			}
		} else {
			setLoadingBalance(false);
		}
	}, [account, TokenBalance, dispatch]);

	if (loadingBalance) {
		return (
			<Row>
				<Col xs={12} lg={{ offset: 3, span: 6 }}>
					<ResponsiveCard className={"d-flex align-items-center justify-content-center py-5"}>
						<Loading width={40} height={40} id={"check-balance"} active />
					</ResponsiveCard>
				</Col>
			</Row>
		);
	}
	// @todo: complete component logics
	// if(!enoughCoinBalance) {
	//
	// }

	return props.children;
};

export default CheckBalance;

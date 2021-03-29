/**
 * GraphQl Queries
 *
 */
import { gql } from "apollo-boost";

export const GET_AAVE_RESERVES = gql`
	{
		reserves {
			id
			name
			symbol
			decimals
			liquidityRate
			variableBorrowRate
			price {
				priceInEth
			}
			stableBorrowRate
			averageStableBorrowRate
			aToken {
				id
			}
		}
	}
`;

/*export const GET_USER_AAVE_DATA = gql`
{
    query UserData($userAddress: String! ){
        user(id: $userAddress){
           id,
           reserves{
            id,
            userBalanceIndex,
            principalATokenBalance,
            redirectedBalance,
            principalBorrows,
            borrowRateMode,
            borrowRate,
            usageAsCollateralEnabledOnUser,
           }
     }
   }
`;*/

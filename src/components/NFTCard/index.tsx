import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import moment from "moment";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { NFT_REFERRER_ACCOUNT } from "../../constants";
import { useActiveWeb3React } from "../../hooks";
import useTheme from "../../hooks/useTheme";
import { toUnitAmount } from "../../lib/helper";
import { useWalletModalToggle } from "../../state/application/hooks";
import Loading from "../Loading";
import * as Styled from "./styleds";

export type Order = {
	listingTime?: any;
	asset?: any;
	assetBundle?: any;
	currentPrice?: any;
	paymentTokenContract?: any;
};

export type NFTCardProps = {
	seaport?: any;
	order?: Order;
	loading?: boolean;
};

const NFTCard = ({ loading, order, seaport }: NFTCardProps) => {
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	const theme = useTheme();
	const toggleWalletModal = useWalletModalToggle();
	const [creatingOrder, setCreatingOrder] = useState(false);
	const { listingTime, asset, assetBundle, currentPrice, paymentTokenContract } = order || {};

	const price = !order ? "0" : toUnitAmount(currentPrice, paymentTokenContract);
	// @ts-ignore
	const priceLabel = parseFloat(price).toLocaleString(undefined, { minimumSignificantDigits: 1 });

	const owner = !order ? undefined : asset ? asset.owner : assetBundle.assets[0].owner;

	const ts = !order ? Date.now() : listingTime.toNumber() * 1000;
	const timeLabel = moment(ts).local().fromNow();
	const isOwner = !order ? false : account && account.toLowerCase() === owner.address.toLowerCase();

	const buyHandler = async (e: any) => {
		e.preventDefault();
		if (account) {
			if (seaport) {
				try {
					const message = t("instantSwap.orderSubmitted");
					setCreatingOrder(true);
					await seaport.fulfillOrder({
						order,
						accountAddress: account,
						referrerAddress: NFT_REFERRER_ACCOUNT,
					});
					toast.success(message);
				} catch (error) {
					if (error?.hasOwnProperty("code") && error?.code !== 4001) {
						toast.error(error?.message || t("errors.default"));
					}
				} finally {
					setCreatingOrder(false);
				}
			}
		} else {
			toggleWalletModal();
		}
	};

	return (
		<Styled.Wrapper>
			<SkeletonTheme color={theme.bg4} highlightColor={theme.modalBG}>
				<Styled.ImageContainer>
					{loading ? (
						<Skeleton
							width={"100%"}
							height={"100%"}
							style={{ position: "absolute", top: 0, left: 0, borderRadius: 18 }}
						/>
					) : (
						<Styled.Image src={asset ? asset.imageUrl : assetBundle.assets[0].imageUrl} alt={asset.name} />
					)}
				</Styled.ImageContainer>
				<Styled.Content>
					<Styled.CollectionText>
						{loading ? (
							<Skeleton width={"80px"} height={16} />
						) : asset ? (
							asset.collection.name
						) : (
							assetBundle.assets[0].collection.name
						)}
					</Styled.CollectionText>
					<Styled.Name>
						{loading ? <Skeleton width={"120px"} height={24} /> : asset ? asset.name : assetBundle.name}
					</Styled.Name>
					<Styled.DetailsList>
						<Styled.DetailsItem>
							{loading ? (
								<div className={"d-flex align-items-center"}>
									<Skeleton width={22} height={22} circle />
									<Styled.DetailsText>
										<Skeleton width={45} className={"mr-2"} />
										<Skeleton width={16} />
									</Styled.DetailsText>
								</div>
							) : (
								<>
									<SVG src={require("../../assets/images/nft/price.svg").default} />
									<Styled.DetailsText bold>
										{priceLabel} {paymentTokenContract.symbol}
									</Styled.DetailsText>
								</>
							)}
						</Styled.DetailsItem>
						<Styled.DetailsItem>
							{loading ? (
								<div className={"d-flex align-items-center"}>
									<Skeleton width={22} height={22} circle />
									<Styled.DetailsText>
										<Skeleton width={24} className={"mr-2"} />
										<Skeleton width={36} className={"mr-2"} />
										<Skeleton width={28} />
									</Styled.DetailsText>
								</div>
							) : (
								<>
									<SVG src={require("../../assets/images/nft/date.svg").default} />
									<Styled.DetailsText>{timeLabel}</Styled.DetailsText>
								</>
							)}
						</Styled.DetailsItem>
					</Styled.DetailsList>
				</Styled.Content>
				{loading ? (
					<Skeleton height={40} width={"100%"} style={{ borderRadius: 12 }} />
				) : (
					<Styled.StyledButton
						onClick={buyHandler}
						className={`btn btn-${
							isOwner ? "secondary-light" : "primary"
						} btn-block py-1 mt-auto d-flex align-items-center justify-content-center`}
					>
						{!account ? (
							"Connect Wallet"
						) : creatingOrder ? (
							<Loading
								width={24}
								height={24}
								active
								color={"#fff"}
								id={`buy-nft-${asset ? asset.token_id : assetBundle.assets[0].token_id}`}
							/>
						) : isOwner ? (
							"Sell Asset"
						) : (
							"Buy Asset"
						)}
					</Styled.StyledButton>
				)}
			</SkeletonTheme>
		</Styled.Wrapper>
	);
};

export default NFTCard;

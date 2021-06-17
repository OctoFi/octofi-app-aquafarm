import styled from "styled-components";
import SVG from "react-inlinesvg";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import Img from "../UI/Img";
import { useActiveWeb3React } from "../../hooks";
import moment from "moment";
import { toUnitAmount } from "../../lib/helper";
import { useState } from "react";
import Loading from "../Loading";
import toast from "react-hot-toast";
import { useWalletModalToggle } from "../../state/application/hooks";
import { NFT_REFERRER_ACCOUNT } from "../../constants";
import { useIsDarkMode } from "../../state/user/hooks";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	text-decoration: none;
	display: flex;
	flex-direction: column;
	background-color: ${({ theme }) => theme.bg2};
	border-radius: 12px;
	padding: 10px;
	height: calc(100% - 20px);
	margin-bottom: 20px;
	border: 1px solid ${({ theme }) => theme.text4};

	@media (max-width: 991px) {
		padding: 20px;
	}

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}

	> div {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
`;

const ImageContainer = styled.div`
	width: 100%;
	padding-top: 100%;
	position: relative;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	margin-bottom: 15px;

	@media (max-width: 991px) {
		margin-bottom: 20px;
	}
`;

const Image = styled(Img)`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	border-radius: 12px;
`;

const Content = styled.div`
	padding: 0 5px;
	display: flex;
	flex-direction: column;

	@media (max-width: 991px) {
		padding: 0;
	}
`;

const CollectionText = styled.span`
	display: block;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;
	margin-bottom: 5px;

	@media (max-width: 991px) {
		margin-bottom: 11px;
	}
`;

const Name = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;
	line-height: 19px;
	margin-bottom: 1rem;

	@media (max-width: 991px) {
		font-size: 1.125rem;
		line-height: 22px;
	}
`;

const DetailsList = styled.ul`
	margin: 0 0 20px;
	padding: 0;
	display: flex;
	flex-direction: column;
	list-style: none;

	@media (max-width: 991px) {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 40px;
	}
`;

const DetailsItem = styled.li`
	display: flex;
	align-items: center;

	&:not(:last-child) {
		margin-bottom: 15px;

		@media (max-width: 991px) {
			margin-bottom: 0;
		}
	}
`;

const DetailsText = styled.span`
	display: block;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: ${({ bold }) => (bold ? 700 : 400)};
	padding-left: 11px;

	@media (max-width: 991px) {
		padding-left: 6px;
	}
`;

const StyledButton = styled.button`
	height: 40px;
	border-radius: 12px;
	font-size: 0.875rem;
`;

const NFTCard = (props) => {
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	const toggleWalletModal = useWalletModalToggle();
	const [creatingOrder, refresh] = useState(false);
	const { loading, order, seaport } = props;
	const darkMode = useIsDarkMode();

	const { listingTime, asset, assetBundle, currentPrice, paymentTokenContract } = order || {};

	const price = !order ? "0" : toUnitAmount(currentPrice, paymentTokenContract);
	const priceLabel = parseFloat(price).toLocaleString(undefined, { minimumSignificantDigits: 1 });

	const owner = !order ? undefined : asset ? asset.owner : assetBundle.assets[0].owner;

	const ts = !order ? Date.now() : listingTime.toNumber() * 1000;
	const timeLabel = moment(ts).local().fromNow();
	const isOwner = !order ? false : account && account.toLowerCase() === owner.address.toLowerCase();

	const buyHandler = async (e) => {
		e.preventDefault();
		if (account) {
			if (seaport) {
				try {
					refresh(true);
					await seaport.fulfillOrder({
						order,
						accountAddress: account,
						referrerAddress: NFT_REFERRER_ACCOUNT,
					});
					toast.success(t("instantSwap.orderSubmitted"));
				} catch (error) {
					if (error?.hasOwnProperty("code") && error?.code !== 4001) {
						toast.error(error?.message || t("errors.default"));
					}
				} finally {
					refresh(false);
				}
			}
		} else {
			toggleWalletModal();
		}
	};

	return (
		<Wrapper>
			<SkeletonTheme
				color={darkMode ? "#232429" : "rgb(212, 218, 242)"}
				highlightColor={darkMode ? "#2b2f36" : "#F3F5FD"}
			>
				<ImageContainer>
					{loading ? (
						<Skeleton
							width={"100%"}
							height={"100%"}
							style={{ position: "absolute", top: 0, left: 0, borderRadius: 18 }}
						/>
					) : (
						<Image src={asset ? asset.imageUrl : assetBundle.assets[0].imageUrl} alt={props.name} />
					)}
				</ImageContainer>
				<Content>
					<CollectionText>
						{loading ? (
							<Skeleton width={"80px"} height={16} />
						) : asset ? (
							asset.collection.name
						) : (
							assetBundle.assets[0].collection.name
						)}
					</CollectionText>
					<Name>
						{loading ? <Skeleton width={"120px"} height={24} /> : asset ? asset.name : assetBundle.name}
					</Name>
					<DetailsList>
						<DetailsItem>
							{loading ? (
								<div className={"d-flex align-items-center"}>
									<Skeleton width={22} height={22} circle />
									<DetailsText>
										<Skeleton width={45} className={"mr-2"} />
										<Skeleton width={16} />
									</DetailsText>
								</div>
							) : (
								<>
									<SVG src={require("../../assets/images/nft/price.svg").default} />
									<DetailsText bold>
										{priceLabel} {paymentTokenContract.symbol}
									</DetailsText>
								</>
							)}
						</DetailsItem>
						<DetailsItem>
							{loading ? (
								<div className={"d-flex align-items-center"}>
									<Skeleton width={22} height={22} circle />
									<DetailsText>
										<Skeleton width={24} className={"mr-2"} />
										<Skeleton width={36} className={"mr-2"} />
										<Skeleton width={28} />
									</DetailsText>
								</div>
							) : (
								<>
									<SVG src={require("../../assets/images/nft/date.svg").default} />
									<DetailsText>{timeLabel}</DetailsText>
								</>
							)}
						</DetailsItem>
					</DetailsList>
				</Content>
				{loading ? (
					<Skeleton height={40} width={"100%"} style={{ borderRadius: 12 }} />
				) : (
					<StyledButton
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
					</StyledButton>
				)}
			</SkeletonTheme>
		</Wrapper>
	);
};

export default NFTCard;

import {
	ActionType,
	AmountDenomination,
	AmountReference,
	ConfirmationType,
	ExpiryV2CallFunctionType,
	LimitOrderCallFunctionType,
	ProxyType,
} from "./types";
import { addressesAreEqual, bytesToHexString, hexStringToBytes, toBytes, toNumber } from "./lib/helpers";
import expiryConstants from "./lib/expiry-constants.json";
import BigNumber from "bignumber.js";
import { ADDRESSES, INTEGERS } from "./lib/constants";

export class AccountOperation {
	constructor(contracts, orderMapper, limitOrders, stopLimitOrders, canonicalOrders, networkId, options) {
		// use the passed-in proxy type, but support the old way of passing in `usePayableProxy = true`
		const proxy = options.proxy || (options.usePayableProxy ? ProxyType.Payable : null) || ProxyType.None;

		this.contracts = contracts;
		this.actions = [];
		this.committed = false;
		this.orderMapper = orderMapper;
		this.limitOrders = limitOrders;
		this.stopLimitOrders = stopLimitOrders;
		this.canonicalOrders = canonicalOrders;
		this.accounts = [];
		this.proxy = proxy;
		this.sendEthTo = options.sendEthTo;
		this.auths = [];
		this.networkId = networkId;
	}

	deposit(deposit) {
		this.addActionArgs(deposit, {
			actionType: ActionType.Deposit,
			amount: deposit.amount,
			otherAddress: deposit.from,
			primaryMarketId: deposit.marketId.toFixed(0),
		});

		return this;
	}

	withdraw(withdraw) {
		this.addActionArgs(withdraw, {
			amount: withdraw.amount,
			actionType: ActionType.Withdraw,
			otherAddress: withdraw.to,
			primaryMarketId: withdraw.marketId.toFixed(0),
		});

		return this;
	}

	transfer(transfer) {
		this.addActionArgs(transfer, {
			actionType: ActionType.Transfer,
			amount: transfer.amount,
			primaryMarketId: transfer.marketId.toFixed(0),
			otherAccountId: this.getAccountId(transfer.toAccountOwner, transfer.toAccountId),
		});

		return this;
	}

	buy(buy) {
		return this.exchange(buy, ActionType.Buy);
	}

	sell(sell) {
		return this.exchange(sell, ActionType.Sell);
	}

	liquidate(liquidate) {
		this.addActionArgs(liquidate, {
			actionType: ActionType.Liquidate,
			amount: liquidate.amount,
			primaryMarketId: liquidate.liquidMarketId.toFixed(0),
			secondaryMarketId: liquidate.payoutMarketId.toFixed(0),
			otherAccountId: this.getAccountId(liquidate.liquidAccountOwner, liquidate.liquidAccountId),
		});

		return this;
	}

	vaporize(vaporize) {
		this.addActionArgs(vaporize, {
			actionType: ActionType.Vaporize,
			amount: vaporize.amount,
			primaryMarketId: vaporize.vaporMarketId.toFixed(0),
			secondaryMarketId: vaporize.payoutMarketId.toFixed(0),
			otherAccountId: this.getAccountId(vaporize.vaporAccountOwner, vaporize.vaporAccountId),
		});

		return this;
	}

	setExpiry(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.expiry.options.address,
			data: toBytes(args.marketId, args.expiryTime),
		});

		return this;
	}

	setApprovalForExpiryV2(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.expiryV2.options.address,
			data: toBytes(ExpiryV2CallFunctionType.SetApproval, args.sender, args.minTimeDelta),
		});

		return this;
	}

	setExpiryV2(args) {
		const callType = toBytes(ExpiryV2CallFunctionType.SetExpiry);
		let callData = callType;
		callData = callData.concat(toBytes(new BigNumber(64)));
		callData = callData.concat(toBytes(new BigNumber(args.expiryV2Args.length)));
		for (let i = 0; i < args.expiryV2Args.length; i += 1) {
			const expiryV2Arg = args.expiryV2Args[i];
			callData = callData.concat(
				toBytes(
					expiryV2Arg.accountOwner,
					expiryV2Arg.accountId,
					expiryV2Arg.marketId,
					expiryV2Arg.timeDelta,
					expiryV2Arg.forceUpdate
				)
			);
		}
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.expiryV2.options.address,
			data: callData,
		});

		return this;
	}

	approveLimitOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.limitOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Approve, this.limitOrders.unsignedOrderToBytes(args.order)),
		});
		return this;
	}

	cancelLimitOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.limitOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Cancel, this.limitOrders.unsignedOrderToBytes(args.order)),
		});
		return this;
	}

	approveStopLimitOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.stopLimitOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Approve, this.stopLimitOrders.unsignedOrderToBytes(args.order)),
		});
		return this;
	}

	cancelStopLimitOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.stopLimitOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Cancel, this.stopLimitOrders.unsignedOrderToBytes(args.order)),
		});
		return this;
	}

	approveCanonicalOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.canonicalOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Approve, this.canonicalOrders.orderToBytes(args.order)),
		});
		return this;
	}

	cancelCanonicalOrder(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: this.contracts.canonicalOrders.options.address,
			data: toBytes(LimitOrderCallFunctionType.Cancel, this.canonicalOrders.orderToBytes(args.order)),
		});
		return this;
	}

	setCanonicalOrderFillArgs(primaryAccountOwner, primaryAccountId, price, fee) {
		this.addActionArgs(
			{
				primaryAccountOwner,
				primaryAccountId,
			},
			{
				actionType: ActionType.Call,
				otherAddress: this.contracts.canonicalOrders.options.address,
				data: toBytes(
					LimitOrderCallFunctionType.SetFillArgs,
					this.canonicalOrders.toSolidity(price),
					this.canonicalOrders.toSolidity(fee.abs()),
					fee.isNegative()
				),
			}
		);
		return this;
	}

	call(args) {
		this.addActionArgs(args, {
			actionType: ActionType.Call,
			otherAddress: args.callee,
			data: args.data,
		});

		return this;
	}

	trade(trade) {
		this.addActionArgs(trade, {
			actionType: ActionType.Trade,
			amount: trade.amount,
			primaryMarketId: trade.inputMarketId.toFixed(0),
			secondaryMarketId: trade.outputMarketId.toFixed(0),
			otherAccountId: this.getAccountId(trade.otherAccountOwner, trade.otherAccountId),
			otherAddress: trade.autoTrader,
			data: trade.data,
		});

		return this;
	}

	fillSignedLimitOrder(primaryAccountOwner, primaryAccountNumber, order, weiAmount, denotedInMakerAmount = false) {
		return this.fillLimitOrderInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			order,
			weiAmount,
			denotedInMakerAmount,
			true
		);
	}

	fillPreApprovedLimitOrder(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		weiAmount,
		denotedInMakerAmount = false
	) {
		return this.fillLimitOrderInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			order,
			weiAmount,
			denotedInMakerAmount,
			false
		);
	}

	fillSignedDecreaseOnlyStopLimitOrder(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		denotedInMakerAmount = false
	) {
		const amount = {
			denomination: AmountDenomination.Par,
			reference: AmountReference.Target,
			value: INTEGERS.ZERO,
		};
		return this.fillStopLimitOrderInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			order,
			amount,
			denotedInMakerAmount,
			true
		);
	}

	fillSignedStopLimitOrder(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		weiAmount,
		denotedInMakerAmount = false
	) {
		const amount = {
			denomination: AmountDenomination.Wei,
			reference: AmountReference.Delta,
			value: weiAmount.abs().times(denotedInMakerAmount ? -1 : 1),
		};
		return this.fillStopLimitOrderInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			order,
			amount,
			denotedInMakerAmount,
			true
		);
	}

	fillPreApprovedStopLimitOrder(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		weiAmount,
		denotedInMakerAmount = false
	) {
		const amount = {
			denomination: AmountDenomination.Wei,
			reference: AmountReference.Delta,
			value: weiAmount.abs().times(denotedInMakerAmount ? -1 : 1),
		};
		return this.fillStopLimitOrderInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			order,
			amount,
			denotedInMakerAmount,
			false
		);
	}

	fillCanonicalOrder(primaryAccountOwner, primaryAccountNumber, order, amount, price, fee) {
		return this.trade({
			primaryAccountOwner,
			primaryAccountId: primaryAccountNumber,
			autoTrader: this.contracts.canonicalOrders.options.address,
			inputMarketId: order.baseMarket,
			outputMarketId: order.quoteMarket,
			otherAccountOwner: order.makerAccountOwner,
			otherAccountId: order.makerAccountNumber,
			data: hexStringToBytes(this.canonicalOrders.orderToBytes(order, price, fee)),
			amount: {
				denomination: AmountDenomination.Wei,
				reference: AmountReference.Delta,
				value: order.isBuy ? amount : amount.negated(),
			},
		});
	}

	fillDecreaseOnlyCanonicalOrder(primaryAccountOwner, primaryAccountNumber, order, price, fee) {
		return this.trade({
			primaryAccountOwner,
			primaryAccountId: primaryAccountNumber,
			autoTrader: this.contracts.canonicalOrders.options.address,
			inputMarketId: order.isBuy ? order.baseMarket : order.quoteMarket,
			outputMarketId: order.isBuy ? order.quoteMarket : order.baseMarket,
			otherAccountOwner: order.makerAccountOwner,
			otherAccountId: order.makerAccountNumber,
			data: hexStringToBytes(this.canonicalOrders.orderToBytes(order, price, fee)),
			amount: {
				denomination: AmountDenomination.Par,
				reference: AmountReference.Target,
				value: INTEGERS.ZERO,
			},
		});
	}

	refund(refundArgs) {
		return this.trade({
			primaryAccountOwner: refundArgs.primaryAccountOwner,
			primaryAccountId: refundArgs.primaryAccountId,
			inputMarketId: refundArgs.refundMarketId,
			outputMarketId: refundArgs.otherMarketId,
			otherAccountOwner: refundArgs.receiverAccountOwner,
			otherAccountId: refundArgs.receiverAccountId,
			amount: {
				value: refundArgs.wei,
				denomination: AmountDenomination.Actual,
				reference: AmountReference.Delta,
			},
			data: [],
			autoTrader: this.contracts.refunder.options.address,
		});
	}

	daiMigrate(migrateArgs) {
		const saiMarket = new BigNumber(1);
		const daiMarket = new BigNumber(3);
		return this.trade({
			primaryAccountOwner: migrateArgs.primaryAccountOwner,
			primaryAccountId: migrateArgs.primaryAccountId,
			inputMarketId: saiMarket,
			outputMarketId: daiMarket,
			otherAccountOwner: migrateArgs.userAccountOwner,
			otherAccountId: migrateArgs.userAccountId,
			amount: migrateArgs.amount,
			data: [],
			autoTrader: this.contracts.daiMigrator.options.address,
		});
	}

	liquidateExpiredAccount(liquidate, maxExpiry) {
		return this.liquidateExpiredAccountInternal(
			liquidate,
			maxExpiry || INTEGERS.ONES_31,
			this.contracts.expiry.options.address
		);
	}

	liquidateExpiredAccountV2(liquidate, maxExpiry) {
		return this.liquidateExpiredAccountInternal(
			liquidate,
			maxExpiry || INTEGERS.ONES_31,
			this.contracts.expiryV2.options.address
		);
	}

	liquidateExpiredAccountInternal(liquidate, maxExpiryTimestamp, contractAddress) {
		this.addActionArgs(liquidate, {
			actionType: ActionType.Trade,
			amount: liquidate.amount,
			primaryMarketId: liquidate.liquidMarketId.toFixed(0),
			secondaryMarketId: liquidate.payoutMarketId.toFixed(0),
			otherAccountId: this.getAccountId(liquidate.liquidAccountOwner, liquidate.liquidAccountId),
			otherAddress: contractAddress,
			data: toBytes(liquidate.liquidMarketId, maxExpiryTimestamp),
		});
		return this;
	}

	fullyLiquidateExpiredAccount(
		primaryAccountOwner,
		primaryAccountNumber,
		expiredAccountOwner,
		expiredAccountNumber,
		expiredMarket,
		expiryTimestamp,
		blockTimestamp,
		weis,
		prices,
		spreadPremiums,
		collateralPreferences
	) {
		return this.fullyLiquidateExpiredAccountInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			expiredAccountOwner,
			expiredAccountNumber,
			expiredMarket,
			expiryTimestamp,
			blockTimestamp,
			weis,
			prices,
			spreadPremiums,
			collateralPreferences,
			this.contracts.expiry.options.address
		);
	}

	fullyLiquidateExpiredAccountV2(
		primaryAccountOwner,
		primaryAccountNumber,
		expiredAccountOwner,
		expiredAccountNumber,
		expiredMarket,
		expiryTimestamp,
		blockTimestamp,
		weis,
		prices,
		spreadPremiums,
		collateralPreferences
	) {
		return this.fullyLiquidateExpiredAccountInternal(
			primaryAccountOwner,
			primaryAccountNumber,
			expiredAccountOwner,
			expiredAccountNumber,
			expiredMarket,
			expiryTimestamp,
			blockTimestamp,
			weis,
			prices,
			spreadPremiums,
			collateralPreferences,
			this.contracts.expiryV2.options.address
		);
	}

	fullyLiquidateExpiredAccountInternal(
		primaryAccountOwner,
		primaryAccountNumber,
		expiredAccountOwner,
		expiredAccountNumber,
		expiredMarket,
		expiryTimestamp,
		blockTimestamp,
		weis,
		prices,
		spreadPremiums,
		collateralPreferences,
		contractAddress
	) {
		// hardcoded values
		const networkExpiryConstants = expiryConstants[this.networkId];
		const defaultSpread = new BigNumber(networkExpiryConstants.spread);
		const expiryRampTime = new BigNumber(networkExpiryConstants.expiryRampTime);

		// get info about the expired market
		let owedWei = weis[expiredMarket.toNumber()];
		const owedPrice = prices[expiredMarket.toNumber()];
		const owedSpreadMult = spreadPremiums[expiredMarket.toNumber()].plus(1);

		// error checking
		if (owedWei.gte(0)) {
			throw new Error("Expired account must have negative expired balance");
		}
		if (blockTimestamp.lt(expiryTimestamp)) {
			throw new Error("Expiry timestamp must be larger than blockTimestamp");
		}

		// loop through each collateral type as long as there is some borrow amount left
		for (let i = 0; i < collateralPreferences.length && owedWei.lt(0); i += 1) {
			// get info about the next collateral market
			const heldMarket = collateralPreferences[i];
			const heldWei = weis[heldMarket.toNumber()];
			const heldPrice = prices[heldMarket.toNumber()];
			const heldSpreadMult = spreadPremiums[heldMarket.toNumber()].plus(1);

			// skip this collateral market if the account is not positive in this market
			if (heldWei.lte(0)) {
				continue;
			}

			// get the relative value of each market
			const rampAdjustment = BigNumber.min(
				blockTimestamp.minus(expiryTimestamp).div(expiryRampTime),
				INTEGERS.ONE
			);
			const spread = defaultSpread.times(heldSpreadMult).times(owedSpreadMult).plus(1);
			const heldValue = heldWei.times(heldPrice).abs();
			const owedValue = owedWei.times(owedPrice).times(rampAdjustment).times(spread).abs();

			// add variables that need to be populated
			let primaryMarketId;
			let secondaryMarketId;

			// set remaining owedWei and the marketIds depending on which market will 'bound' the action
			if (heldValue.gt(owedValue)) {
				// we expect no remaining owedWei
				owedWei = INTEGERS.ZERO;

				primaryMarketId = expiredMarket;
				secondaryMarketId = heldMarket;
			} else {
				// calculate the expected remaining owedWei
				owedWei = owedValue.minus(heldValue).div(owedValue).times(owedWei);

				primaryMarketId = heldMarket;
				secondaryMarketId = expiredMarket;
			}

			// add the action to the current actions
			this.addActionArgs(
				{
					primaryAccountOwner,
					primaryAccountId: primaryAccountNumber,
				},
				{
					actionType: ActionType.Trade,
					amount: {
						value: INTEGERS.ZERO,
						denomination: AmountDenomination.Principal,
						reference: AmountReference.Target,
					},
					primaryMarketId: primaryMarketId.toFixed(0),
					secondaryMarketId: secondaryMarketId.toFixed(0),
					otherAccountId: this.getAccountId(expiredAccountOwner, expiredAccountNumber),
					otherAddress: contractAddress,
					data: toBytes(expiredMarket, expiryTimestamp),
				}
			);
		}

		return this;
	}

	/**
	 * Adds all actions from a SignedOperation and also adds the authorization object that allows the
	 * proxy to process the actions.
	 */
	addSignedOperation(signedOperation) {
		// throw error if operation is not going to use the signed proxy
		if (this.proxy !== ProxyType.Signed) {
			throw new Error("Cannot add signed operation if not using signed operation proxy");
		}

		// store the auth
		this.auths.push({
			startIndex: new BigNumber(this.actions.length),
			numActions: new BigNumber(signedOperation.actions.length),
			salt: signedOperation.salt,
			expiration: signedOperation.expiration,
			sender: signedOperation.sender,
			signer: signedOperation.signer,
			typedSignature: signedOperation.typedSignature,
		});

		// store the actions
		for (let i = 0; i < signedOperation.actions.length; i += 1) {
			const action = signedOperation.actions[i];

			const secondaryAccountId =
				action.secondaryAccountOwner === ADDRESSES.ZERO
					? 0
					: this.getAccountId(action.secondaryAccountOwner, action.secondaryAccountNumber);

			this.addActionArgs(
				{
					primaryAccountOwner: action.primaryAccountOwner,
					primaryAccountId: action.primaryAccountNumber,
				},
				{
					actionType: action.actionType,
					primaryMarketId: action.primaryMarketId.toFixed(0),
					secondaryMarketId: action.secondaryMarketId.toFixed(0),
					otherAddress: action.otherAddress,
					otherAccountId: secondaryAccountId,
					data: hexStringToBytes(action.data),
					amount: {
						reference: action.amount.ref,
						denomination: action.amount.denomination,
						value: action.amount.value.times(action.amount.sign ? 1 : -1),
					},
				}
			);
		}

		return this;
	}

	/**
	 * Takes all current actions/accounts and creates an Operation struct that can then be signed and
	 * later used with the SignedOperationProxy.
	 */
	createSignableOperation(options = {}) {
		if (this.auths.length) {
			throw new Error("Cannot create operation out of operation with auths");
		}
		if (!this.actions.length) {
			throw new Error("Cannot create operation out of operation with no actions");
		}

		function actionArgsToAction(action) {
			const secondaryAccount =
				action.actionType === ActionType.Transfer ||
				action.actionType === ActionType.Trade ||
				action.actionType === ActionType.Liquidate ||
				action.actionType === ActionType.Vaporize
					? this.accounts[action.otherAccountId]
					: { owner: ADDRESSES.ZERO, number: "0" };

			return {
				actionType: toNumber(action.actionType),
				primaryAccountOwner: this.accounts[action.accountId].owner,
				primaryAccountNumber: new BigNumber(this.accounts[action.accountId].number),
				secondaryAccountOwner: secondaryAccount.owner,
				secondaryAccountNumber: new BigNumber(secondaryAccount.number),
				primaryMarketId: new BigNumber(action.primaryMarketId),
				secondaryMarketId: new BigNumber(action.secondaryMarketId),
				amount: {
					sign: action.amount.sign,
					ref: toNumber(action.amount.ref),
					denomination: toNumber(action.amount.denomination),
					value: new BigNumber(action.amount.value),
				},
				otherAddress: action.otherAddress,
				data: bytesToHexString(action.data),
			};
		}

		const actions = this.actions.map(actionArgsToAction.bind(this));

		return {
			actions,
			expiration: options.expiration || INTEGERS.ZERO,
			salt: options.salt || INTEGERS.ZERO,
			sender: options.sender || ADDRESSES.ZERO,
			signer: options.signer || this.accounts[0].owner,
		};
	}

	/**
	 * Commits the operation to the chain by sending a transaction.
	 */
	async commit(options = {}) {
		if (this.committed) {
			throw new Error("Operation already committed");
		}
		if (this.actions.length === 0) {
			throw new Error("No actions have been added to operation");
		}

		if (options && options.confirmationType !== ConfirmationType.Simulate) {
			this.committed = true;
		}

		try {
			let method;

			switch (this.proxy) {
				case ProxyType.None:
					method = this.contracts.soloMargin.methods.operate(this.accounts, this.actions);
					break;
				case ProxyType.Payable:
					method = this.contracts.payableProxy.methods.operate(
						this.accounts,
						this.actions,
						this.sendEthTo || (options && options.from) || this.contracts.payableProxy.options.from
					);
					break;
				case ProxyType.Signed:
					method = this.contracts.signedOperationProxy.methods.operate(
						this.accounts,
						this.actions,
						this.generateAuthData()
					);
					break;
				default:
					throw new Error(`Invalid proxy type: ${this.proxy}`);
			}

			return this.contracts.send(method, options);
		} catch (error) {
			this.committed = false;
			throw error;
		}
	}

	// ============ Private Helper Functions ============

	/**
	 * Internal logic for filling limit orders (either signed or pre-approved orders)
	 */
	fillLimitOrderInternal(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		weiAmount,
		denotedInMakerAmount,
		isSignedOrder
	) {
		const dataString = isSignedOrder
			? this.limitOrders.signedOrderToBytes(order)
			: this.limitOrders.unsignedOrderToBytes(order);
		const amount = weiAmount.abs().times(denotedInMakerAmount ? -1 : 1);
		return this.trade({
			primaryAccountOwner,
			primaryAccountId: primaryAccountNumber,
			autoTrader: this.contracts.limitOrders.options.address,
			inputMarketId: denotedInMakerAmount ? order.makerMarket : order.takerMarket,
			outputMarketId: denotedInMakerAmount ? order.takerMarket : order.makerMarket,
			otherAccountOwner: order.makerAccountOwner,
			otherAccountId: order.makerAccountNumber,
			amount: {
				denomination: AmountDenomination.Wei,
				reference: AmountReference.Delta,
				value: amount,
			},
			data: hexStringToBytes(dataString),
		});
	}

	/**
	 * Internal logic for filling stop-limit orders (either signed or pre-approved orders)
	 */
	fillStopLimitOrderInternal(
		primaryAccountOwner,
		primaryAccountNumber,
		order,
		amount,
		denotedInMakerAmount,
		isSignedOrder
	) {
		const dataString = isSignedOrder
			? this.stopLimitOrders.signedOrderToBytes(order)
			: this.stopLimitOrders.unsignedOrderToBytes(order);
		return this.trade({
			amount,
			primaryAccountOwner,
			primaryAccountId: primaryAccountNumber,
			autoTrader: this.contracts.stopLimitOrders.options.address,
			inputMarketId: denotedInMakerAmount ? order.makerMarket : order.takerMarket,
			outputMarketId: denotedInMakerAmount ? order.takerMarket : order.makerMarket,
			otherAccountOwner: order.makerAccountOwner,
			otherAccountId: order.makerAccountNumber,
			data: hexStringToBytes(dataString),
		});
	}

	exchange(exchange, actionType) {
		const { bytes, exchangeWrapperAddress } = this.orderMapper.mapOrder(exchange.order);

		const [primaryMarketId, secondaryMarketId] =
			actionType === ActionType.Buy
				? [exchange.makerMarketId, exchange.takerMarketId]
				: [exchange.takerMarketId, exchange.makerMarketId];

		const orderData = bytes.map((a) => [a]);

		this.addActionArgs(exchange, {
			actionType,
			amount: exchange.amount,
			otherAddress: exchangeWrapperAddress,
			data: orderData,
			primaryMarketId: primaryMarketId.toFixed(0),
			secondaryMarketId: secondaryMarketId.toFixed(0),
		});

		return this;
	}

	addActionArgs(action, args) {
		if (this.committed) {
			throw new Error("Operation already committed");
		}

		const amount = args.amount
			? {
					sign: !args.amount.value.isNegative(),
					denomination: args.amount.denomination,
					ref: args.amount.reference,
					value: args.amount.value.abs().toFixed(0),
			  }
			: {
					sign: false,
					denomination: 0,
					ref: 0,
					value: 0,
			  };

		const actionArgs = {
			amount,
			accountId: this.getPrimaryAccountId(action),
			actionType: args.actionType,
			primaryMarketId: args.primaryMarketId || "0",
			secondaryMarketId: args.secondaryMarketId || "0",
			otherAddress: args.otherAddress || ADDRESSES.ZERO,
			otherAccountId: args.otherAccountId || "0",
			data: args.data || [],
		};

		this.actions.push(actionArgs);
	}

	getPrimaryAccountId(operation) {
		return this.getAccountId(operation.primaryAccountOwner, operation.primaryAccountId);
	}

	getAccountId(accountOwner, accountNumber) {
		const accountInfo = {
			owner: accountOwner,
			number: accountNumber.toFixed(0),
		};

		const correctIndex = (i) => addressesAreEqual(i.owner, accountInfo.owner) && i.number === accountInfo.number;
		const index = this.accounts.findIndex(correctIndex);

		if (index >= 0) {
			return index;
		}

		this.accounts.push(accountInfo);

		return this.accounts.length - 1;
	}

	generateAuthData() {
		let actionIndex = INTEGERS.ZERO;
		const result = [];

		const emptyAuth = {
			numActions: "0",
			header: {
				expiration: "0",
				salt: "0",
				sender: ADDRESSES.ZERO,
				signer: ADDRESSES.ZERO,
			},
			signature: [],
		};

		// for each signed auth
		for (let i = 0; i < this.auths.length; i += 1) {
			const auth = this.auths[i];

			// if empty auth needed, push it
			if (auth.startIndex.gt(actionIndex)) {
				result.push({
					...emptyAuth,
					numActions: auth.startIndex.minus(actionIndex).toFixed(0),
				});
			}

			// push this auth
			result.push({
				numActions: auth.numActions.toFixed(0),
				header: {
					expiration: auth.expiration.toFixed(0),
					salt: auth.salt.toFixed(0),
					sender: auth.sender,
					signer: auth.signer,
				},
				signature: toBytes(auth.typedSignature),
			});

			// update the action index
			actionIndex = auth.startIndex.plus(auth.numActions);
		}

		// push a final empty auth if necessary
		if (actionIndex.lt(this.actions.length)) {
			result.push({
				...emptyAuth,
				numActions: new BigNumber(this.actions.length).minus(actionIndex).toFixed(0),
			});
		}

		return result;
	}
}

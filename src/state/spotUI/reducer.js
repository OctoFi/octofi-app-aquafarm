import { createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";

const initialStepsModalState = {
	doneSteps: [],
	currentStep: null,
	pendingSteps: [],
};
const initialUIState = {
	notifications: [],
	fills: [],
	marketFills: {},
	userFills: [],
	userMarketFills: {},
	hasUnreadNotifications: false,
	stepsModal: initialStepsModalState,
	orderPriceSelected: null,
	orderBuyPriceSelected: null,
	orderSellPriceSelected: null,
	makerAmountSelected: null,
	sidebarOpen: false,
	fiatType: "APPLE_PAY",
	startTour: false,
	openFiatOnRampModal: false,
	openFiatOnRampChooseModal: false,
	configData: null,
	isAffiliate: false,
};

export default createReducer(initialUIState, (builder) => {
	builder
		.addCase(actions.addMarketFills, (state, action) => {
			const marketFills = state.marketFills;
			const mf = {};

			Object.keys({ ...(action.payload || {}), ...marketFills }).forEach((m) => {
				if (action.payload && Object.keys(action.payload).length > 0 && Array.isArray(action.payload[m])) {
					if (marketFills[m] && marketFills[m].length) {
						const newFills = action.payload[m].filter((fill) => {
							const doesAlreadyExist = marketFills[m].some((f) => f.id === fill.id);
							return !doesAlreadyExist;
						});
						newFills.length ? (mf[m] = [...newFills, ...marketFills[m]]) : (mf[m] = [...marketFills[m]]);
					} else {
						mf[m] = action.payload[m];
					}
				} else {
					if (marketFills[m] && marketFills[m].length) {
						mf[m] = [...marketFills[m]];
					}
				}
			});

			if (action.payload && Object.keys(action.payload).length > 0) {
				return {
					...state,
					marketFills: mf,
				};
			} else {
				return state;
			}
		})
		.addCase(actions.setMakerAmountSelected, (state, action) => {
			return { ...state, makerAmountSelected: action.payload };
		})
		.addCase(actions.setOrderBuyPriceSelected, (state, action) => {
			return { ...state, orderBuyPriceSelected: action.payload };
		})
		.addCase(actions.setOrderPriceSelected, (state, action) => {
			return { ...state, orderPriceSelected: action.payload };
		})
		.addCase(actions.setOrderSellPriceSelected, (state, action) => {
			return { ...state, orderSellPriceSelected: action.payload };
		})
		.addCase(actions.setStepsModalCurrentStep, (state, action) => {
			return {
				...state,
				stepsModal: {
					...state.stepsModal,
					currentStep: action.payload,
				},
			};
		})
		.addCase(actions.setStepsModalPendingSteps, (state, action) => {
			return {
				...state,
				stepsModal: {
					...state.stepsModal,
					pendingSteps: action.payload,
				},
			};
		})
		.addCase(actions.setStepsModalDoneSteps, (state, action) => {
			return {
				...state,
				stepsModal: {
					...state.stepsModal,
					doneSteps: action.payload,
				},
			};
		})
		.addCase(actions.setOrderSecondsExpirationTime, (state, action) => {
			return { ...state, orderSecondsExpirationTime: action.payload };
		})
		.addCase(actions.stepsModalAdvanceStep, (state, action) => {
			const { doneSteps, currentStep, pendingSteps } = state.stepsModal;
			let newSteps;
			if (currentStep === null && pendingSteps.length === 0) {
				newSteps = state.stepsModal;
			} else if (pendingSteps.length === 0 && currentStep !== null) {
				newSteps = {
					...state.stepsModal,
					doneSteps: doneSteps.concat([currentStep]),
					currentStep: null,
				};
			} else {
				newSteps = {
					...state.stepsModal,
					pendingSteps: pendingSteps.slice(1),
					doneSteps: doneSteps.concat([currentStep]),
					currentStep: pendingSteps[0],
				};
			}
			return {
				...state,
				stepsModal: newSteps,
			};
		});
});

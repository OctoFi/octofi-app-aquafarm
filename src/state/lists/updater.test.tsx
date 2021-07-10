import { render } from "../../testing/customRender";
import { reducer } from "../../testing/testReducer";
import { asFn } from "../../testing/utils";
import Updater from "./updater";

import { useAllLists } from "./hooks";
import { useFetchListCallback } from "../../hooks/useFetchListCallback";
import * as uni from "@uniswap/token-lists";

jest.mock("../../hooks", () => ({
	useActiveWeb3React: () => ({ library: jest.fn() }),
}));
jest.mock("../../hooks/useFetchListCallback", () => ({
	useFetchListCallback: jest.fn(() => jest.fn(() => Promise.resolve())),
}));
jest.mock("../../hooks/useInterval", () => jest.fn());
jest.mock("../../hooks/useIsWindowVisible", () => jest.fn());
jest.mock("./hooks", () => ({
	useActiveListUrls: jest.fn(),
	useAllLists: jest.fn(() => ({})),
}));

// forward declaration for typing
let fetchList = jest.fn(() => Promise.resolve());

test("only fetches list for each list url", () => {
	const emptyUrlData = {};
	setup(emptyUrlData);

	render(<Updater />);

	expect(fetchList).not.toBeCalled();
});

test("fetches list for each list url", () => {
	setup({ url1: {} });

	render(<Updater />);

	expect(fetchList).toBeCalled();
});

test("does not fetch with current url data", () => {
	setup({ url1: { current: {} } });

	render(<Updater />);

	expect(fetchList).not.toBeCalled();
});

test("does not fetch with loading url data", () => {
	setup({ url1: { loadingRequestId: true } });

	render(<Updater />);

	expect(fetchList).not.toBeCalled();
});

test("does not fetch with error on url data", () => {
	setup({ url1: { error: true } });

	render(<Updater />);

	expect(fetchList).not.toBeCalled();
});

test("throws if fetching NONE upgrade type", () => {
	setup({ url1: { current: {}, pendingUpdate: {} } });
	jest.spyOn(uni, "getVersionUpgrade").mockImplementation(() => uni.VersionUpgrade.NONE);

	expect(() => render(<Updater />)).toThrowError();
});

test("fetches upgrade if version equal to or greater", () => {
	setup({ url1: { current: {}, pendingUpdate: {} } });
	jest.spyOn(uni, "getVersionUpgrade").mockImplementation(() => uni.VersionUpgrade.PATCH);
	jest.spyOn(uni, "minVersionBump").mockImplementation(() => uni.VersionUpgrade.PATCH);

	render(<Updater />);

	expect(reducer.mock.calls[reducer.mock.calls.length - 1][1].payload).toBe("url1");
});

test("fetches upgrade if version is major", () => {
	setup({ url1: { current: {}, pendingUpdate: {} } });
	jest.spyOn(uni, "getVersionUpgrade").mockImplementation(() => uni.VersionUpgrade.MAJOR);

	render(<Updater />);

	expect(reducer.mock.calls[reducer.mock.calls.length - 1][1].payload).toBe("url1");
});

test("does not fetch upgrade if version less than", () => {
	setup({ url1: { current: {}, pendingUpdate: {} } });
	jest.spyOn(uni, "getVersionUpgrade").mockImplementation(() => uni.VersionUpgrade.PATCH);
	jest.spyOn(uni, "minVersionBump").mockImplementation(() => uni.VersionUpgrade.MINOR);

	render(<Updater />);

	expect(reducer.mock.calls[reducer.mock.calls.length - 1][1].payload).not.toBe("url1");
});

const setup = (urlData: any) => {
	asFn(useAllLists).mockImplementation(() => urlData);
	asFn(useFetchListCallback).mockImplementation(jest.fn(() => fetchList));
	fetchList = jest.fn(() => Promise.resolve());
};

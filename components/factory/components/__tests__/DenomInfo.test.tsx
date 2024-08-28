import { afterEach, describe, expect, test, jest } from "bun:test";
import React from "react";
import {
  screen,
  cleanup,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import DenomInfo from "@/components/factory/components/DenomInfo";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockDenom, mockMfxDenom } from "@/tests/mock";

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denom: null,
    address: "test-address",
    refetchDenoms: jest.fn(),
    balance: null,
    isBalanceLoading: false,
  };
  return renderWithChainProvider(<DenomInfo {...defaultProps} {...props} />);
};

describe("DenomInfo", () => {
  afterEach(cleanup);

  test("renders 'No Denom Selected' message when no denom is provided", () => {
    renderWithProps();
    expect(screen.getByText("No Denom Selected")).toBeInTheDocument();
  });

  test("renders denom metadata correctly", () => {
    renderWithProps({ denom: mockDenom });
    expect(screen.getByText("Metadata")).toBeInTheDocument();
    expect(screen.getByText("TICKER")).toBeInTheDocument();
    const tickerContainer = screen.getByLabelText("ticker");
    expect(within(tickerContainer).getByText("TEST")).toBeInTheDocument();
    expect(screen.getByText("BASE DENOM")).toBeInTheDocument();
    const baseDenomContainer = screen.getByLabelText("base denom");
    expect(
      within(baseDenomContainer).getByText("TTT...TTT"),
    ).toBeInTheDocument();
    const symbolContainer = screen.getByLabelText("symbol");
    expect(within(symbolContainer).getByText("TST")).toBeInTheDocument();
  });

  test("renders balance loading state correctly", () => {
    renderWithProps({ denom: mockDenom, isBalanceLoading: true });
    expect(screen.getByText("0 TEST1")).toBeInTheDocument();
  });

  test("renders balance correctly when loading is complete", () => {
    const balance = { amount: "1000000" };
    renderWithProps({ denom: mockDenom, balance, isBalanceLoading: false });
    expect(screen.getByText("1 TEST = 1,000,000 UTEST1")).toBeInTheDocument();
  });

  test("update button is disabled for MFX tokens", () => {
    renderWithProps({ denom: mockMfxDenom });
    const updateMetadataButton = screen.getByLabelText("update metadata");
    expect(within(updateMetadataButton).getByText("Update")).toBeDisabled();
  });

  test("update button is enabled for non-MFX tokens", () => {
    renderWithProps({ denom: mockDenom });
    const updateMetadataButton = screen.getByLabelText("update metadata");
    expect(within(updateMetadataButton).getByText("Update")).toBeEnabled();
  });

  test("renders and triggers 'More Info' button", async () => {
    renderWithProps({ denom: mockDenom });
    fireEvent.click(screen.getByText("More Info"));
    const modal = await waitFor(() =>
      document.getElementById(`denom_info_${mockDenom.base}`),
    );
    expect(modal).toBeVisible();
  });
});

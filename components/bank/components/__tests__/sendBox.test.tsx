import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from "@testing-library/jest-dom/matchers";
import {screen, cleanup, waitFor, fireEvent, within} from "@testing-library/react";
import SendBox from "@/components/bank/components/sendBox";
import {mockBalances} from "@/tests/mock";
import {renderWithChainProvider} from "@/tests/render";

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    address: "test_address",
    balances: mockBalances,
    isBalancesLoading: false,
    refetchBalances: () => {},
  }
  return renderWithChainProvider(<SendBox {...defaultProps} {...props} />);
};

describe("SendBox", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders correctly", () => {
    renderWithProps();
    expect(screen.getByText("Send Tokens")).toBeInTheDocument();
  });

  test("toggles between Send and IBC Transfer", async () => {
    renderWithProps();
    const buttonContainer = screen.getByLabelText("buttons");
    expect(within(buttonContainer).getByText("Send")).toBeInTheDocument();
    expect(within(buttonContainer).getByText("IBC Transfer")).toBeInTheDocument();

    const tabsContainer = screen.getByLabelText("tabs");
    expect(within(tabsContainer).getByText("Send Tokens")).toBeInTheDocument();

    fireEvent.click(within(buttonContainer).getByText("IBC Transfer"));
    await waitFor(() => expect(within(tabsContainer).getByText("IBC Transfer")).toBeInTheDocument());
  });

  test("displays chain selection dropdown when in IBC Transfer mode", async () => {
    renderWithProps();
    fireEvent.click(screen.getByText("IBC Transfer"));
    await waitFor(() => expect(screen.getByText("Chain")).toBeInTheDocument());
  });

  test("selects a chain in IBC Transfer mode", async () => {
    renderWithProps();
    const buttonContainer = screen.getByLabelText("buttons");
    expect(within(buttonContainer).getByText("IBC Transfer")).toBeInTheDocument();
    fireEvent.click(within(buttonContainer).getByText("IBC Transfer"));
    fireEvent.click(screen.getByText("Chain"));
    fireEvent.click(screen.getByLabelText("Osmosis"));
    await waitFor(() => expect(screen.getByAltText("Osmosis")).toBeInTheDocument());
  });
});

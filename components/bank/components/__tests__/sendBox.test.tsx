import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from "@testing-library/jest-dom/matchers";
import {fireEvent, screen, cleanup, waitFor} from "@testing-library/react";
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

  // TODO: Failing
  // test("toggles between Send and IBC Transfer", () => {
  //   renderWithProps();
  //   expect(screen.getByText("Send Tokens")).toBeInTheDocument();
  //
  //   fireEvent.click(screen.getByText("IBC Transfer"));
  //   expect(screen.getByText("IBC Transfer")).toBeInTheDocument();
  // });

  test("displays chain selection dropdown when in IBC Transfer mode", async () => {
    renderWithProps();
    fireEvent.click(screen.getByText("IBC Transfer"));
    await waitFor(() => expect(screen.getByText("Chain")).toBeInTheDocument());
  });

  // TODO: Failing
  // test("selects a chain in IBC Transfer mode", async () => {
  //   renderWithProps();
  //
  //   fireEvent.click(screen.getByText("IBC Transfer"));
  //   fireEvent.click(screen.getByText("Chain"));
  //   fireEvent.click(screen.getByText("Osmosis"));
  //
  //   await waitFor(() => expect(screen.getByText("Osmosis")).toBeInTheDocument());
  // });
});

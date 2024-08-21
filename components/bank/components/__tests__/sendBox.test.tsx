import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from "@testing-library/jest-dom/matchers";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import SendBox from "@/components/bank/components/sendBox";
import { CombinedBalanceInfo } from "@/pages/bank";

expect.extend(matchers);

const mockBalances: CombinedBalanceInfo[] = [
  {
    denom: "token1",
    coreDenom: "utoken1",
    amount: "1000",
    metadata: {
      description: "My First Token",
      name: "Token 1",
      symbol: "TK1",
      uri: "",
      uri_hash: "",
      display: "Token 1",
      base: "token1",
      denom_units: [
        { denom: "utoken1", exponent: 0, aliases: ["utoken1"] },
        { denom: "token1", exponent: 6, aliases: ["token1"] },
      ],
    },
  },
];

describe("SendBox", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders correctly", () => {
    render(
      <SendBox
        address="test_address"
        balances={mockBalances}
        isBalancesLoading={false}
        refetchBalances={() => {}}
      />
    );
    expect(screen.getByText("Send Tokens")).toBeInTheDocument();
  });

  test("toggles between Send and IBC Transfer", () => {
    render(
      <SendBox
        address="test_address"
        balances={mockBalances}
        isBalancesLoading={false}
        refetchBalances={() => {}}
      />
    );
    expect(screen.getByText("Send Tokens")).toBeInTheDocument();

    fireEvent.click(screen.getByText("IBC Transfer"));
    expect(screen.getByText("IBC Transfer")).toBeInTheDocument();
  });

  test("displays chain selection dropdown when in IBC Transfer mode", () => {
    render(
      <SendBox
        address="test_address"
        balances={mockBalances}
        isBalancesLoading={false}
        refetchBalances={() => {}}
      />
    );

    fireEvent.click(screen.getByText("IBC Transfer"));
    expect(screen.getByText("Chain")).toBeInTheDocument();
  });

  test("selects a chain in IBC Transfer mode", () => {
    render(
      <SendBox
        address="test_address"
        balances={mockBalances}
        isBalancesLoading={false}
        refetchBalances={() => {}}
      />
    );

    fireEvent.click(screen.getByText("IBC Transfer"));
    fireEvent.click(screen.getByText("Chain"));
    fireEvent.click(screen.getByText("Osmosis"));

    expect(screen.getByText("Osmosis")).toBeInTheDocument();
  });
});

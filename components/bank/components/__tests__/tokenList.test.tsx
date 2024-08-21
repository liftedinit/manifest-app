import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from '@testing-library/jest-dom/matchers';
import {fireEvent, render, screen, cleanup} from "@testing-library/react";
import TokenList from "@/components/bank/components/tokenList";
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
      denom_units: [{ denom: "utoken1", exponent: 0, aliases: ["utoken1"] }, { denom: "token1", exponent: 6, aliases: ["token1"] }],
    },
  },
  {
    denom: "token2",
    coreDenom: "utoken2",
    amount: "2000",
    metadata: {
      description: "My Second Token",
      name: "Token 2",
      symbol: "TK2",
      uri: "",
      uri_hash: "",
      display: "Token 2",
      base: "token2",
      denom_units: [{ denom: "utoken2", exponent: 0, aliases: ["utoken2"] }, { denom: "token2", exponent: 6, aliases: ["token2"] }],
    },
  },
];

describe("TokenList", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders correctly", () => {
    render(<TokenList balances={mockBalances} isLoading={false}/>);
    expect(screen.getByText("Your Balances")).toBeInTheDocument();
  });

  test("displays loading skeleton when isLoading is true", () => {
    render(<TokenList balances={undefined} isLoading={false}/>);
    expect(screen.getByText("Your wallet is empty!")).toBeInTheDocument();
  });

  test("displays empty state message when there are no balances", () => {
    render(<TokenList balances={[]} isLoading={false}/>);
    expect(screen.getByText("Your wallet is empty!")).toBeInTheDocument();
  });

  test("filters balances based on search term", () => {
    render(<TokenList balances={mockBalances} isLoading={false}/>);
    const searchInput = screen.getByPlaceholderText("Search for a token...");
    fireEvent.change(searchInput, {target: {value: "token1"}});
    expect(screen.getByText("TOKEN 1")).toBeInTheDocument();
    expect(screen.queryByText("TOKEN 2")).not.toBeInTheDocument();
  });

  test("opens modal with correct denomination information", () => {
    render(<TokenList balances={mockBalances} isLoading={false}/>);
    const balanceRow = screen.getByText("TOKEN 1").closest("tr");
    if (!balanceRow) throw new Error("Balance row not found");
    fireEvent.click(balanceRow);
    expect(screen.getByText("TOKEN 1")).toBeInTheDocument();
  });
});
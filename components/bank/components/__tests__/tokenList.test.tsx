import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from '@testing-library/jest-dom/matchers';
import {fireEvent, render, screen, cleanup} from "@testing-library/react";
import TokenList from "@/components/bank/components/tokenList";
import {mockBalances} from "@/tests/mock";

expect.extend(matchers);

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

  test("displays correct balance for each token", () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    expect(screen.getByText("0.001")).toBeInTheDocument();
    expect(screen.getByText("0.002")).toBeInTheDocument();
  });

  test("displays correct base denomination for each token", () => {
    render(<TokenList balances={mockBalances} isLoading={false} />);
    expect(screen.getByText("token1")).toBeInTheDocument();
    expect(screen.getByText("token2")).toBeInTheDocument();
  });
});

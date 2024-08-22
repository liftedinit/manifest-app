import { test, expect, afterEach, describe } from "bun:test";
import React from "react";
import matchers from "@testing-library/jest-dom/matchers";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import {
  HistoryBox,
  TransactionGroup,
} from "@/components/bank/components/historyBox";

expect.extend(matchers);

const mockTransactions: TransactionGroup[] = [
  {
    tx_hash: "hash1",
    block_number: 1,
    formatted_date: "2023-05-01T12:00:00Z",
    data: {
      from_address: "address1",
      to_address: "address2",
      amount: [{ amount: "1000000", denom: "utoken" }],
    },
  },
  {
    tx_hash: "hash2",
    block_number: 2,
    formatted_date: "2023-05-02T12:00:00Z",
    data: {
      from_address: "address2",
      to_address: "address1",
      amount: [{ amount: "2000000", denom: "utoken" }],
    },
  },
];

describe("HistoryBox", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders correctly", () => {
    render(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="address1"
      />
    );
    expect(screen.getByText("Tx History")).toBeInTheDocument();
  });

  test("displays transactions", () => {
    render(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="address1"
      />
    );
    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Receive")).toBeInTheDocument();
  });

  test("displays 'No transactions found' message when there are no transactions", () => {
    render(<HistoryBox isLoading={false} send={[]} address="address1" />);
    expect(
      screen.getByText("No transactions found for this account!")
    ).toBeInTheDocument();
  });

  test("opens modal when clicking on a transaction", () => {
    render(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="address1"
      />
    );
    fireEvent.click(screen.getByText("Send"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("formats date correctly", () => {
    render(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="address1"
      />
    );
    expect(screen.getByText("May 1, 2023")).toBeInTheDocument();
  });

  test("formats amount correctly", () => {
    render(
      <HistoryBox
        isLoading={false}
        send={mockTransactions}
        address="address1"
      />
    );
    expect(screen.getByText("1 TOKEN")).toBeInTheDocument();
  });
});

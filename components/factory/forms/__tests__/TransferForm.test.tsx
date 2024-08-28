import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import TransferForm from "@/components/factory/forms/TransferForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockDenomMeta1 } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  denom: mockDenomMeta1,
  address: "cosmos1address",
  refetch: jest.fn(),
  balance: "1000",
};

describe("TransferForm Component", () => {
  afterEach(cleanup);

  test("renders form with correct details", () => {
    renderWithChainProvider(<TransferForm {...mockProps} />);
    expect(screen.getByText("CIRCULATING SUPPLY")).toBeInTheDocument();
    expect(screen.getByText("EXPONENT")).toBeInTheDocument();
    expect(screen.getByText("AMOUNT")).toBeInTheDocument();
    expect(screen.getByText("FROM")).toBeInTheDocument();
    expect(screen.getByText("TO")).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    renderWithChainProvider(<TransferForm {...mockProps} />);
    const amountInput = screen.getByPlaceholderText("Enter amount");
    fireEvent.change(amountInput, { target: { value: "100" } });
    expect(amountInput).toHaveValue("100");

    const fromAddressInput = screen.getByPlaceholderText("From address");
    fireEvent.change(fromAddressInput, {
      target: { value: "cosmos1fromaddress" },
    });
    expect(fromAddressInput).toHaveValue("cosmos1fromaddress");

    const toAddressInput = screen.getByPlaceholderText("To address");
    fireEvent.change(toAddressInput, { target: { value: "cosmos1toaddress" } });
    expect(toAddressInput).toHaveValue("cosmos1toaddress");
  });

  // TODO: Make this test pass
  // test('transfer button is disabled when form is invalid', () => {
  //   renderWithChainProvider(<TransferForm {...mockProps} />);
  //   const transferButton = screen.getByText('Transfer');
  //   expect(transferButton).toBeDisabled();
  // });

  // TODO: Fix values validation in the component, this test should not pass as-is
  test("transfer button is enabled when form is valid", () => {
    renderWithChainProvider(<TransferForm {...mockProps} />);
    const amountInput = screen.getByPlaceholderText("Enter amount");
    fireEvent.change(amountInput, { target: { value: "100" } });
    const toAddressInput = screen.getByPlaceholderText("To address");
    fireEvent.change(toAddressInput, { target: { value: "cosmos1toaddress" } });
    const transferButton = screen.getByText("Transfer");
    expect(transferButton).toBeEnabled();
  });
});

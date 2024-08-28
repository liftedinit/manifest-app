import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import MintForm from "@/components/factory/forms/MintForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockDenomMeta1 } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  isAdmin: true,
  admin: "cosmos1adminaddress",
  denom: mockDenomMeta1,
  address: "cosmos1address",
  refetch: jest.fn(),
  balance: "1000000",
};

describe("MintForm Component", () => {
  afterEach(cleanup);

  test("renders form with correct details", () => {
    renderWithChainProvider(<MintForm {...mockProps} />);
    expect(screen.getByText("NAME")).toBeInTheDocument();
    expect(screen.getByText("YOUR BALANCE")).toBeInTheDocument();
    expect(screen.getByText("EXPONENT")).toBeInTheDocument();
    expect(screen.getByText("CIRCULATING SUPPLY")).toBeInTheDocument();
  });

  test("updates amount input correctly", () => {
    renderWithChainProvider(<MintForm {...mockProps} />);
    const amountInput = screen.getByLabelText("mint-amount-input");
    fireEvent.change(amountInput, { target: { value: "100" } });
    expect(amountInput).toHaveValue("100");
  });

  test("updates recipient input correctly", () => {
    renderWithChainProvider(<MintForm {...mockProps} />);
    const recipientInput = screen.getByLabelText("mint-recipient-input");
    fireEvent.change(recipientInput, { target: { value: "cosmos1recipient" } });
    expect(recipientInput).toHaveValue("cosmos1recipient");
  });

  // TODO: Button is disabled when inputs are invalid
  // test('mint button is disabled when inputs are invalid', () => {
  //   renderWithChainProvider(<MintForm {...mockProps} />);
  //   const mintButton = screen.getByText('Mint');
  //   expect(mintButton).toBeDisabled();
  // });
  //
  // TODO: Button is enabled when inputs are valid
  //       Fix values validation in the component, this test should not pass as-is
  test("mint button is enabled when inputs are valid", () => {
    renderWithChainProvider(<MintForm {...mockProps} />);
    fireEvent.change(screen.getByLabelText("mint-amount-input"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("mint-recipient-input"), {
      target: { value: "cosmos1recipient" },
    });
    const mintButton = screen.getByText("Mint");
    expect(mintButton).toBeEnabled();
  });
});

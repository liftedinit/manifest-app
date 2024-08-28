import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import ProposalMessages from "@/components/groups/forms/proposals/ProposalMessages";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockProposalFormData } from "@/tests/mock";
import { SendMessage } from "@/helpers";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
};

describe("ProposalMessages Component", () => {
  afterEach(cleanup);

  test("renders component with correct details", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Next: Proposal Metadata")).toBeInTheDocument();
    expect(screen.getByText("Prev: Proposal Details")).toBeInTheDocument();
  });

  // test("updates form fields correctly", () => {
  //   renderWithChainProvider(<ProposalMessages {...mockProps} />);
  //   const amountInput = screen.getByPlaceholderText("Enter amount");
  //   fireEvent.change(amountInput, { target: { value: "200" } });
  //   expect(amountInput).toHaveValue("200");
  //
  //   const toAddressInput = screen.getByPlaceholderText("Enter to address");
  //   fireEvent.change(toAddressInput, { target: { value: "newaddress" } });
  //   expect(toAddressInput).toHaveValue("newaddress");
  // });

  test("next button is disabled when form is invalid", () => {
    const invalidFormData = {
      ...mockProposalFormData,
      messages: [
        {
          type: "send",
          amount: { denom: "", amount: "" },
          to_address: "",
          from_address: "",
        } as SendMessage,
      ],
    };
    renderWithChainProvider(
      <ProposalMessages {...mockProps} formData={invalidFormData} />,
    );
    const nextButton = screen.getByText("Next: Proposal Metadata");
    expect(nextButton).toBeDisabled();
  });

  test("next button is enabled when form is valid", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const nextButton = screen.getByText("Next: Proposal Metadata");
    expect(nextButton).toBeEnabled();
  });

  test("calls nextStep when next button is clicked", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const nextButton = screen.getByText("Next: Proposal Metadata");
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test("calls prevStep when prev button is clicked", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const prevButton = screen.getByText("Prev: Proposal Details");
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });

  test("adds and removes messages correctly", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const addButton = screen.getByLabelText("add-message-btn");
    fireEvent.click(addButton);
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "ADD_MESSAGE",
      message: expect.any(Object),
    });

    const removeButton = screen.getByLabelText("remove-message-btn");
    fireEvent.click(removeButton);
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "REMOVE_MESSAGE",
      index: 0,
    });
  });

  test("changes message type correctly", () => {
    renderWithChainProvider(<ProposalMessages {...mockProps} />);
    const typeButton = screen.getByLabelText("message-type-btn-send");
    fireEvent.click(typeButton);
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_MESSAGE",
      index: 0,
      message: expect.objectContaining({ type: "send" }),
    });
  });
});

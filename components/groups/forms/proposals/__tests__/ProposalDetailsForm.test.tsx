import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import ProposalDetails from "@/components/groups/forms/proposals/ProposalDetailsForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockProposalFormData } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
  address: "cosmos1address",
};

describe("ProposalDetails Component", () => {
  afterEach(cleanup);

  test("renders component with correct details", () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("Proposal Title")).toBeInTheDocument();
    expect(screen.getByText("Proposer")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const titleInput = screen.getByPlaceholderText("Title");
    fireEvent.change(titleInput, { target: { value: "New Proposal Title" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "title",
      value: "New Proposal Title",
    });

    const proposersInput = screen.getByPlaceholderText("List of authors");
    fireEvent.change(proposersInput, { target: { value: "New Proposer" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "proposers",
      value: "New Proposer",
    });

    const summaryInput = screen.getByPlaceholderText("Short Bio");
    fireEvent.change(summaryInput, { target: { value: "New Summary" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "summary",
      value: "New Summary",
    });
  });

  test("next button is disabled when form is invalid", () => {
    const invalidFormData = { ...mockProposalFormData, title: "" };
    renderWithChainProvider(
      <ProposalDetails {...mockProps} formData={invalidFormData} />,
    );
    const nextButton = screen.getByText("Next: Proposal Messages");
    expect(nextButton).toBeDisabled();
  });

  test("next button is enabled when form is valid", () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const nextButton = screen.getByText("Next: Proposal Messages");
    expect(nextButton).toBeEnabled();
  });

  test("calls nextStep when next button is clicked", () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const nextButton = screen.getByText("Next: Proposal Messages");
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test("updates proposers field with address when address button is clicked", () => {
    renderWithChainProvider(<ProposalDetails {...mockProps} />);
    const addressButton = screen.getByLabelText("address-btn");
    fireEvent.click(addressButton);
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "proposers",
      value: mockProps.address,
    });
  });
});

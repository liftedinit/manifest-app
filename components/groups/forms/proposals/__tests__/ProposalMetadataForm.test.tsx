import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import ProposalMetadataForm from "@/components/groups/forms/proposals/ProposalMetadataForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockProposalFormData } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
};

describe("ProposalMetadataForm Component", () => {
  afterEach(cleanup);

  test("renders form with correct details", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    expect(screen.getByText("Proposal Metadata")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Authors")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);

    const titleInput = screen.getByLabelText("title-input");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: { ...mockProps.formData.metadata, title: "New Title" },
    });

    const authorsInput = screen.getByLabelText("authors-input");
    fireEvent.change(authorsInput, { target: { value: "New Author" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: { ...mockProps.formData.metadata, authors: "New Author" },
    });

    const summaryInput = screen.getByLabelText("summary-input");
    fireEvent.change(summaryInput, { target: { value: "New Summary" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: { ...mockProps.formData.metadata, summary: "New Summary" },
    });

    const detailsInput = screen.getByLabelText("details-input");
    fireEvent.change(detailsInput, { target: { value: "New Details" } });
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: "UPDATE_FIELD",
      field: "metadata",
      value: { ...mockProps.formData.metadata, details: "New Details" },
    });
  });

  test("next button is disabled when form is invalid", () => {
    const invalidFormData = {
      ...mockProps.formData,
      metadata: { title: "", authors: "", summary: "", details: "" },
    };
    renderWithChainProvider(
      <ProposalMetadataForm {...mockProps} formData={invalidFormData} />,
    );
    const nextButton = screen.getByText("Next: Confirmation");
    expect(nextButton).toBeDisabled();
  });

  test("next button is enabled when form is valid", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const nextButton = screen.getByText("Next: Confirmation");
    expect(nextButton).toBeEnabled();
  });

  test("calls nextStep when next button is clicked", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const nextButton = screen.getByText("Next: Confirmation");
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });

  test("calls prevStep when prev button is clicked", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const prevButton = screen.getByText("Prev: Messages");
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });
});

import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import ProposalMetadataForm from "@/components/groups/forms/proposals/ProposalMetadataForm";
import { renderWithChainProvider } from "@/tests/render";
import { mockProposalFormData } from "@/tests/mock";

const mockProps = {
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  formData: mockProposalFormData,
  dispatch: jest.fn(),
};

describe("ProposalMetadataForm Component", () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("renders form with correct details", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    expect(screen.getByText("Proposal Metadata")).toBeDefined();
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Authors")).toBeDefined();
    expect(screen.getByLabelText("Summary")).toBeDefined();
    expect(screen.getByLabelText("Details")).toBeDefined();
  });

  test("updates form fields correctly", async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: "UPDATE_FIELD",
        field: "metadata",
        value: expect.objectContaining({ title: "New Title" }),
      });
    });

    const authorsInput = screen.getByLabelText("Authors");
    fireEvent.change(authorsInput, { target: { value: "New Author" } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: "UPDATE_FIELD",
        field: "metadata",
        value: expect.objectContaining({ authors: "New Author" }),
      });
    });

    const summaryInput = screen.getByLabelText("Summary");
    fireEvent.change(summaryInput, { target: { value: "New Summary" } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: "UPDATE_FIELD",
        field: "metadata",
        value: expect.objectContaining({ summary: "New Summary" }),
      });
    });

    const detailsInput = screen.getByLabelText("Details");
    fireEvent.change(detailsInput, { target: { value: "New Details" } });
    await waitFor(() => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        type: "UPDATE_FIELD",
        field: "metadata",
        value: expect.objectContaining({ details: "New Details" }),
      });
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
    const nextButton = screen.getByText(
      "Next: Confirmation",
    ) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  test("next button is enabled when form is valid and dirty", async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    await waitFor(() => {
      const nextButton = screen.getByText(
        "Next: Confirmation",
      ) as HTMLButtonElement;
      expect(nextButton.disabled).toBe(false);
    });
  });

  test("calls nextStep when next button is clicked", async () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    await waitFor(() => {
      const nextButton = screen.getByText("Next: Confirmation");
      fireEvent.click(nextButton);
      expect(mockProps.nextStep).toHaveBeenCalled();
    });
  });

  test("calls prevStep when prev button is clicked", () => {
    renderWithChainProvider(<ProposalMetadataForm {...mockProps} />);
    const prevButton = screen.getByText("Prev: Messages");
    fireEvent.click(prevButton);
    expect(mockProps.prevStep).toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, jest, test } from "bun:test";
import React from "react";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import GroupDetails from "@/components/groups/forms/groups/GroupDetailsForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockGroupFormData } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  nextStep: jest.fn(),
  formData: mockGroupFormData,
  dispatch: jest.fn(),
  address: "cosmos1address",
};

describe("GroupDetails Component", () => {
  afterEach(cleanup);

  test("renders component with correct details", () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    expect(screen.getByText("Group details")).toBeInTheDocument();
    expect(screen.getByText("Group Title")).toBeInTheDocument();
    expect(screen.getByText("Authors")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Forum Link")).toBeInTheDocument();
  });

  // TODO: Make this test pass. Why is the input not being updated?
  // test('updates form fields correctly', async () => {
  //   renderWithChainProvider(<GroupDetails {...mockProps} />);
  //   const titleInput = screen.getByPlaceholderText('Title');
  //   fireEvent.change(titleInput, { target: { value: 'New Group Title' } });
  //   await waitFor(() => expect(titleInput).toHaveValue('New Group Title'));
  //
  //   const authorsInput = screen.getByPlaceholderText('List of authors or address');
  //   fireEvent.change(authorsInput, { target: { value: 'New Author' } });
  //   expect(authorsInput).toHaveValue('New Author');
  //
  //   const summaryInput = screen.getByPlaceholderText('Short Bio');
  //   fireEvent.change(summaryInput, { target: { value: 'New Summary' } });
  //   expect(summaryInput).toHaveValue('New Summary');
  //
  //   const descriptionInput = screen.getByPlaceholderText('Long Bio');
  //   fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
  //   expect(descriptionInput).toHaveValue('New Description');
  //
  //   const forumLinkInput = screen.getByPlaceholderText('Link to forum');
  //   fireEvent.change(forumLinkInput, { target: { value: 'http://newforumlink.com' } });
  //   expect(forumLinkInput).toHaveValue('http://newforumlink.com');
  // });
  //
  test("next button is disabled when form is invalid", () => {
    const invalidFormData = { ...mockGroupFormData, title: "" };
    renderWithChainProvider(
      <GroupDetails {...mockProps} formData={invalidFormData} />,
    );
    const nextButton = screen.getByText("Next: Group Policy");
    expect(nextButton).toBeDisabled();
  });

  test("next button is enabled when form is valid", () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    const nextButton = screen.getByText("Next: Group Policy");
    expect(nextButton).toBeEnabled();
  });

  test("calls nextStep when next button is clicked", () => {
    renderWithChainProvider(<GroupDetails {...mockProps} />);
    const nextButton = screen.getByText("Next: Group Policy");
    fireEvent.click(nextButton);
    expect(mockProps.nextStep).toHaveBeenCalled();
  });
});

import { describe, test, afterEach, expect } from "bun:test";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { DescriptionModal } from "@/components/admins/modals/descriptionModal";
import matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

describe("DescriptionModal Component", () => {
  const modalId = "test-modal";
  const details = "This is a test description.";

  afterEach(cleanup);

  test("renders modal with correct details", () => {
    render(<DescriptionModal modalId={modalId} details={details} />);
    expect(screen.getByText("Group Description")).toBeInTheDocument();
    expect(screen.getByText(details)).toBeInTheDocument();
  });

  test("displays correct title for validator type", () => {
    render(
      <DescriptionModal modalId={modalId} details={details} type="validator" />,
    );
    expect(screen.getByText("Validator Description")).toBeInTheDocument();
  });

  // TODO: Why is this test failing?
  // // https://github.com/capricorn86/happy-dom/issues/1184
  // test('closes modal when close button is clicked', async () => {
  //   render(<DescriptionModal modalId={modalId} details={details} />);
  //   expect(screen.getByText(details)).toBeInTheDocument();
  //   expect(screen.getByLabelText('x-close')).toBeInTheDocument();
  //   const closeButton = screen.getByLabelText('x-close');
  //   fireEvent.click(closeButton);
  //   await waitFor(() => expect(screen.queryByText(details)).not.toBeInTheDocument());
  // });
});

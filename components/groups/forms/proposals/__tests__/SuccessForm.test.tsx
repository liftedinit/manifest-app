import {
  describe,
  test,
  afterEach,
  expect,
  jest,
  mock,
  afterAll,
} from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import ProposalSuccess from "@/components/groups/forms/proposals/SuccessForm";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockProposalFormData } from "@/tests/mock";

expect.extend(matchers);

// Mock next/router
const m = jest.fn();
mock.module("next/router", () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  }),
}));

const mockProps = {
  formData: mockProposalFormData,
  prevStep: jest.fn(),
};

describe("ProposalSuccess Component", () => {
  afterEach(cleanup);
  afterAll(() => {
    mock.restore();
  });

  test("renders static text correctly", () => {
    renderWithChainProvider(<ProposalSuccess {...mockProps} />);
    expect(
      screen.getByText("Proposal Submitted Successfully!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your proposal has been successfully submitted to the group.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Group members can now vote on your proposal. The voting period will last for the duration specified in the group's settings.",
      ),
    ).toBeInTheDocument();
  });

  test("renders dynamic text correctly", () => {
    renderWithChainProvider(<ProposalSuccess {...mockProps} />);
    expect(screen.getByText(mockProps.formData.title)).toBeInTheDocument();
    expect(
      screen.getByText(mockProps.formData.metadata.summary),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockProps.formData.metadata.details),
    ).toBeInTheDocument();
    mockProps.formData.messages.forEach((message) => {
      expect(screen.getByText(`Type: ${message.type}`)).toBeInTheDocument();
    });
  });
});

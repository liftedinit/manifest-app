import { describe, test, afterEach, expect, jest } from "bun:test";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import Success from "@/components/groups/forms/groups/Success";
import matchers from "@testing-library/jest-dom/matchers";
import { mockGroupFormData } from "@/tests/mock";

expect.extend(matchers);

const mockProps = {
  formData: mockGroupFormData,
  prevStep: jest.fn(),
};

describe("Success Component", () => {
  afterEach(cleanup);

  test("renders component with correct details", () => {
    render(<Success {...mockProps} />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your transaction was successfully signed and broadcasted.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Group Details")).toBeInTheDocument();
    expect(screen.getByText(mockGroupFormData.title)).toBeInTheDocument();
    expect(screen.getByText("manifest1autho...author")).toBeInTheDocument();
    expect(screen.getByText(mockGroupFormData.summary)).toBeInTheDocument();
    expect(screen.getByText(mockGroupFormData.description)).toBeInTheDocument();
    expect(screen.getByText(mockGroupFormData.forumLink)).toBeInTheDocument();
    expect(screen.getByText("3600 seconds")).toBeInTheDocument();
    expect(
      screen.getByText(mockGroupFormData.votingThreshold),
    ).toBeInTheDocument();
  });

  // TODO: Test for `Back to Groups Page` button
});

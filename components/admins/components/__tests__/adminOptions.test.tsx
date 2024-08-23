import { afterEach, describe, expect, test } from "bun:test";
import React from "react";
import {screen, cleanup, within, fireEvent} from "@testing-library/react";
import AdminOptions from "@/components/admins/components/adminOptions";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { mockPoaParams, mockGroup } from "@/tests/mock";

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    poaParams: mockPoaParams,
    group: mockGroup,
    isLoading: false,
    address: "test_address",
    admin: "admin1",
  };
  return renderWithChainProvider(<AdminOptions {...defaultProps} {...props} />);
};

describe("AdminOptions", () => {
  afterEach(cleanup);

  test("renders loading state correctly", () => {
    renderWithProps({ isLoading: true });
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("renders admin details correctly when not loading", () => {
    renderWithProps();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByAltText("Profile Avatar")).toBeInTheDocument();
    const titleContainer = screen.getByLabelText("title");
    expect(within(titleContainer).getByText("title1")).toBeInTheDocument();
    const detailsContainer = screen.getByLabelText("details");
    expect(within(detailsContainer).getByText("details1")).toBeInTheDocument();
  });

  test("opens update modal on button click", () => {
    renderWithProps();
    const updateAdminButtonContainer = screen.getByLabelText("update admin");
    fireEvent.click(within(updateAdminButtonContainer).getByText("Update Admin"));
    const modal = document.getElementById("update-admin-modal") as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(modal.open).toBe(true);
  });

  test("opens description modal on button click", () => {
    renderWithProps();
    fireEvent.click(screen.getByLabelText("three-dots"));
    const modal = document.getElementById("description-modal") as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(modal.open).toBe(true);
  });
});
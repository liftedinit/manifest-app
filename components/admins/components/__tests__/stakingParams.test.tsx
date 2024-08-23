import { afterEach, describe, expect, test } from "bun:test";
import React from "react";
import {screen, cleanup, within, fireEvent} from "@testing-library/react";
import StakingParams from "@/components/admins/components/stakingParams";
import matchers from "@testing-library/jest-dom/matchers";
import {mockStakingParams} from "@/tests/mock";
import {renderWithChainProvider} from "@/tests/render";

expect.extend(matchers);

const renderWithProps = (props = {}) => {
  const defaultProps = {
    stakingParams: mockStakingParams,
    isLoading: false,
    address: "test_address",
    admin: "admin1",
  };
  return renderWithChainProvider(<StakingParams {...defaultProps} {...props} />);
};

describe("StakingParams", () => {
  afterEach(cleanup);

  test("renders correctly when not loading", () => {
    renderWithProps();
    const stakingParamsContainer = screen.getByLabelText("Staking Params");
    expect(within(stakingParamsContainer).getByText("UNBONDING TIME")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("1")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("MAX VALIDATORS")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("100")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("BOND DENOM")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("upoa")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("MINIMUM COMMISSION")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("5 %")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("MAX ENTRIES")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("7")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("HISTORICAL ENTRIES")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("200")).toBeInTheDocument();
  });

  test("renders loading state correctly", () => {
    renderWithProps({ isLoading: true });
    const stakingParamsContainer = screen.getByLabelText("Skeleton Staking Params");
    expect(within(stakingParamsContainer).getByText("Staking Params")).toBeInTheDocument();
    expect(within(stakingParamsContainer).getByText("Update")).toBeInTheDocument();
  });

  test("opens update modal on button click", () => {
    renderWithProps();
    const stakingParamsContainer = screen.getByLabelText("Skeleton Staking Params");
    fireEvent.click(within(stakingParamsContainer).getByText("Update"));
    const modal = document.getElementById("update-params-modal") as HTMLDialogElement;
    expect(modal).toBeInTheDocument();
    expect(modal.open).toBe(true);
  });
});
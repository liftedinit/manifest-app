import { describe, test, afterEach, expect } from "bun:test";
import React from "react";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { UpdateStakingParamsModal } from "@/components/admins/modals/updateStakingParamsModal";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";
import { DurationSDKType } from "@chalabi/manifestjs/src/codegen/google/protobuf/duration";

expect.extend(matchers);

const modalId = "test-modal";
const stakingParams: {
  unbonding_time: DurationSDKType;
  max_validators: number;
  bond_denom: string;
  min_commission_rate: string;
  max_entries: number;
  historical_entries: number;
} = {
  unbonding_time: { seconds: BigInt(86400), nanos: 0 },
  max_validators: 100,
  bond_denom: "stake",
  min_commission_rate: "0.05",
  max_entries: 7,
  historical_entries: 100,
};
const admin = "manifest1adminaddress";
const address = "manifest1useraddress";

function renderWithProps(props = {}) {
  renderWithChainProvider(
    <UpdateStakingParamsModal
      modalId={modalId}
      stakingParams={stakingParams}
      admin={admin}
      address={address}
      {...props}
    />,
  );
}

describe("UpdateStakingParamsModal Component", () => {
  afterEach(cleanup);

  test("renders modal with correct details", () => {
    renderWithProps();
    expect(screen.getByText("Update Staking Parameters")).toBeInTheDocument();
    expect(screen.getByText("UNBONDING TIME")).toBeInTheDocument();
    expect(screen.getByText("MAX VALIDATORS")).toBeInTheDocument();
    expect(screen.getByText("BOND DENOM")).toBeInTheDocument();
    expect(screen.getByText("MINIMUM COMMISSION")).toBeInTheDocument();
    expect(screen.getByText("MAX ENTRIES")).toBeInTheDocument();
    expect(screen.getByText("HISTORICAL ENTRIES")).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    renderWithProps();
    const unbondingTimeInput = screen.getByPlaceholderText("1");
    fireEvent.change(unbondingTimeInput, { target: { value: 2 } });
    expect(unbondingTimeInput).toHaveValue(2);
  });

  test("disables update button when no changes are made", () => {
    renderWithProps();
    const updateButton = screen.getByText("Update");
    expect(updateButton).toBeDisabled();
  });

  test("enables update button when changes are made", () => {
    renderWithProps();
    const unbondingTimeInput = screen.getByPlaceholderText("1");
    fireEvent.change(unbondingTimeInput, { target: { value: 2 } });
    const updateButton = screen.getByText("Update");
    expect(updateButton).toBeEnabled();
  });

  // // TODO: Why is this test failing?
  // // https://github.com/capricorn86/happy-dom/issues/1184
  // test('closes modal when close button is clicked', async () => {
  //   renderWithProps();
  //   const closeButton = screen.getByText('✕');
  //   fireEvent.click(closeButton);
  //   await waitFor(() => expect(screen.queryByText('Update Staking Parameters')).not.toBeInTheDocument());
  // });
});

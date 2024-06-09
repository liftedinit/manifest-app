import React from "react";
import { ParamsSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking";
import { UpdateStakingParamsModal } from "../modals/updateStakingParamsModal";

interface StakingParamsProps {
  stakingParams: ParamsSDKType;
}

export default function StakingParams({ stakingParams }: StakingParamsProps) {
  const openParamsModal = () => {
    const modal = document.getElementById(
      `update-params-modal`
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <div className="lg:w-1/2 w-full mx-auto p-4 bg-base-100 rounded-md lg:max-h-[352px] lg:min-h-[352px]">
      <div className="px-4 py-2 border-base-content flex items-center flex-row justify-between">
        <h3 className="text-lg font-bold leading-6">Staking Params</h3>

        <button
          className="btn btn-primary btn-xs min-w-[4rem]"
          onClick={openParamsModal}
        >
          Update
        </button>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      <div className="flex flex-col gap-8 justify-center items-center w-full">
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">UNBONDING TIME</span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              <span>
                {Number(
                  BigInt(stakingParams.unbonding_time?.seconds ?? 1) /
                    BigInt(86400)
                ).toString()}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">MAX VALIDATORS</span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              {stakingParams.max_validators}
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400 truncate">BOND DENOM</span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              {stakingParams.bond_denom}
            </span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400 truncate">
              MINIMUM COMMISSION
            </span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              {(Number(stakingParams.min_commission_rate) * 100)
                .toFixed(0)
                .toString()}{" "}
              %
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-8 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400">MAX ENTRIES</span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              {stakingParams.max_entries}
            </span>
          </div>
          <div className="flex flex-col gap-2 w-1/2 rounded-md">
            <span className="text-sm text-gray-400 truncate">
              HISTORICAL ENTRIES
            </span>
            <span className="text-md bg-base-300 p-2 rounded-md">
              {stakingParams.historical_entries}
            </span>
          </div>
        </div>
      </div>
      <UpdateStakingParamsModal
        stakingParams={stakingParams}
        modalId="update-params-modal"
      />
    </div>
  );
}

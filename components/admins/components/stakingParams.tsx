import React from 'react';
import { ParamsSDKType } from '@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { UpdateStakingParamsModal } from '../modals/updateStakingParamsModal';

interface StakingParamsProps {
  stakingParams: ParamsSDKType;
  isLoading: boolean;
  address: string;
  admin: string;
}

export default function StakingParams({
  stakingParams,
  isLoading,
  address,
  admin,
}: StakingParamsProps) {
  const openParamsModal = () => {
    const modal = document.getElementById(`update-params-modal`) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <div className="lg:w-1/2 w-full mx-auto p-4 bg-base-100 rounded-md lg:max-h-[352px] lg:min-h-[352px]">
      <div
        className="px-4 py-2 border-base-content flex items-center flex-row justify-between"
        aria-label="Skeleton Staking Params"
      >
        <h3 className="text-lg font-bold leading-6">Staking Params</h3>

        <button className="btn btn-primary btn-xs min-w-[4rem]" onClick={openParamsModal}>
          Update
        </button>
      </div>
      <div className="divider divider-horizon -mt-2 mb-1"></div>
      {isLoading && <div className="skeleton w-full h-auto"></div>}
      {!isLoading && (
        <div
          className="flex flex-col gap-[1.85rem] justify-center items-center w-full px-1"
          aria-label="Staking Params"
        >
          <div className="flex flex-row gap-4 w-full justify-center items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400">UNBONDING TIME</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">
                  {Number(
                    BigInt(stakingParams.unbonding_time?.seconds ?? 1) / BigInt(86400)
                  ).toString()}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400">MAX VALIDATORS</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">{stakingParams.max_validators}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full justify-center items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400 truncate">BOND DENOM</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">{stakingParams.bond_denom}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400 truncate">MINIMUM COMMISSION</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">
                  {(Number(stakingParams.min_commission_rate) * 100).toFixed(0).toString()} %
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-4 w-full justify-center items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400">MAX ENTRIES</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">{stakingParams.max_entries}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 w-1/2 rounded-md">
              <span className="text-sm text-gray-400 truncate">HISTORICAL ENTRIES</span>
              <span className="text-md bg-base-300 py-2 rounded-md">
                <span className="p-2">{stakingParams.historical_entries}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <UpdateStakingParamsModal
        address={address}
        admin={admin}
        stakingParams={stakingParams}
        modalId="update-params-modal"
      />
    </div>
  );
}

import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { strangelove_ventures, cosmos } from '@liftedinit/manifestjs';
import { ParamsSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { MsgUpdateStakingParams } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import React, { useState, useEffect } from 'react';

interface UpdateStakingParamsModalProps {
  modalId: string;
  stakingParams: ParamsSDKType;
  admin: string;
  address: string;
}

export function UpdateStakingParamsModal({
  modalId,
  stakingParams,
  admin,
  address,
}: Readonly<UpdateStakingParamsModalProps>) {
  const [unbondingTime, setUnbondingTime] = useState<string>('');
  const [maxValidators, setMaxValidators] = useState<string>('');
  const [bondDenom, setBondDenom] = useState<string>('');
  const [minCommissionRate, setMinCommissionRate] = useState<string>('');
  const [maxEntries, setMaxEntries] = useState<string>('');
  const [historicalEntries, setHistoricalEntries] = useState<string>('');

  const [isChanged, setIsChanged] = useState(false);

  const { estimateFee } = useFeeEstimation(chainName);
  const { tx } = useTx(chainName);
  const { updateStakingParams } = strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  useEffect(() => {
    setIsChanged(
      unbondingTime !== '' ||
        maxValidators !== '' ||
        bondDenom !== '' ||
        minCommissionRate !== '' ||
        maxEntries !== '' ||
        historicalEntries !== ''
    );
  }, [unbondingTime, maxValidators, bondDenom, minCommissionRate, maxEntries, historicalEntries]);

  const handleUpdate = async () => {
    const msgUpdateStakingParams = updateStakingParams({
      sender: admin ?? '',
      params: {
        unbondingTime: unbondingTime
          ? { seconds: BigInt(parseInt(unbondingTime) * 86400), nanos: 0 }
          : stakingParams.unbonding_time,
        maxValidators: maxValidators ? parseInt(maxValidators) : stakingParams.max_validators,
        bondDenom: bondDenom || stakingParams.bond_denom,
        minCommissionRate: minCommissionRate || stakingParams.min_commission_rate,
        maxEntries: maxEntries ? parseInt(maxEntries) : stakingParams.max_entries,
        historicalEntries: historicalEntries
          ? parseInt(historicalEntries)
          : stakingParams.historical_entries,
      },
    });

    const anyMessage = Any.fromPartial({
      typeUrl: msgUpdateStakingParams.typeUrl,
      value: MsgUpdateStakingParams.encode(msgUpdateStakingParams.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: '',
      proposers: [address ?? ''],
      title: `Update Staking Params`,
      summary: `This proposal will update various staking parameters.`,
      exec: 0,
    });

    const fee = await estimateFee(address ?? '', [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {},
    });
  };

  const renderInput = (
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    tip: string,
    placeholder: string,
    type: string = 'text'
  ) => (
    <div className="flex flex-col gap-2 w-1/2 rounded-md">
      <span className="text-sm text-gray-400">{label}</span>
      <input
        className="input input-bordered input-sm"
        type={type}
        value={value}
        onChange={e => setter(e.target.value)}
        placeholder={placeholder}
      />
      <span className="text-xs text-gray-500">{tip}</span>
    </div>
  );

  return (
    <dialog id={modalId} className="modal">
      <form method="dialog" className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-lg">Update Staking Parameters</h3>
        <div className="divider divider-horizon -mt-0 -mb-0"></div>
        <div className="py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-6 justify-center items-center w-full">
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              {renderInput(
                'UNBONDING TIME',
                unbondingTime,
                setUnbondingTime,
                'Enter time in days',
                '1',
                'number'
              )}
              {renderInput(
                'MAX VALIDATORS',
                maxValidators,
                setMaxValidators,
                'Maximum number of validators',
                stakingParams.max_validators.toString(),
                'number'
              )}
            </div>
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              {renderInput(
                'BOND DENOM',
                bondDenom,
                setBondDenom,
                'Token denomination for bonding',
                stakingParams.bond_denom
              )}
              {renderInput(
                'MINIMUM COMMISSION',
                minCommissionRate,
                setMinCommissionRate,
                'Commission rate (e.g., 0.05 for 5%)',
                stakingParams.min_commission_rate
              )}
            </div>
            <div className="flex flex-row gap-8 w-full justify-center items-center">
              {renderInput(
                'MAX ENTRIES',
                maxEntries,
                setMaxEntries,
                'Maximum entries for either unbonding delegation or redelegation',
                stakingParams.max_entries.toString(),
                'number'
              )}
              {renderInput(
                'HISTORICAL ENTRIES',
                historicalEntries,
                setHistoricalEntries,
                'Number of historical entries to persist',
                stakingParams.historical_entries.toString(),
                'number'
              )}
            </div>
          </div>
        </div>
        <div className="modal-action">
          <button
            type="button"
            onClick={handleUpdate}
            className="btn w-full btn-primary"
            disabled={!isChanged}
          >
            Update
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

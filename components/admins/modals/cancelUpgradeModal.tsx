import { Dialog } from '@headlessui/react';
import { cosmos } from '@liftedinit/manifestjs';
import { MsgCancelUpgrade } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/tx';
import { PlanSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/upgrade/v1beta1/upgrade';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { SignModal } from '@/components/react';
import env from '@/config/env';
import { useFeeEstimation, useTx } from '@/hooks';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: string;
  address: string | null;
  plan: PlanSDKType;
  refetchPlan: () => void;
}

function InfoItem({ label, value }: { label: string; value?: string | number | bigint }) {
  return (
    <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] p-3 rounded-lg h-full">
      <span className="text-sm dark:text-[#FFFFFF66] text-[#00000066] block mb-2">{label}</span>
      <div className="text-sm dark:text-[#FFFFFF99] text-[#00000099]">
        {value?.toString() || 'N/A'}
      </div>
    </div>
  );
}

export function CancelUpgradeModal({
  isOpen,
  onClose,
  admin,
  address,
  plan,
  refetchPlan,
}: BaseModalProps) {
  const { cancelUpgrade } = cosmos.upgrade.v1beta1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;
  const { tx, isSigning } = useTx(env.chain);
  const { estimateFee } = useFeeEstimation(env.chain);

  const handleCancelUpgrade = async () => {
    try {
      const msgUpgrade = cancelUpgrade({
        authority: admin,
      });

      const anyMessage = Any.fromPartial({
        typeUrl: msgUpgrade.typeUrl,
        value: MsgCancelUpgrade.encode(msgUpgrade.value).finish(),
      });

      const groupProposalMsg = submitProposal({
        groupPolicyAddress: admin,
        messages: [anyMessage],
        metadata: '',
        proposers: [address ?? ''],
        title: `Cancel Upgrade`,
        summary: `This proposal will cancel the upgrade`,
        exec: 0,
      });

      const fee = await estimateFee(address ?? '', [groupProposalMsg]);
      await tx([groupProposalMsg], {
        fee,
        onSuccess: () => {
          onClose();
          refetchPlan();
        },
      });
    } catch (error) {
      console.error('Error canceling upgrade:', error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={`modal ${isOpen ? 'modal-open' : ''} flex fixed p-0 m-0`}
      style={{
        zIndex: 9999,
        backgroundColor: 'transparent',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box bg-secondary rounded-[24px] max-w-[542px] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Cancel Upgrade</h3>
          <form method="dialog">
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
        </div>

        {plan && (
          <div className="space-y-4">
            <h4 className="font-semibold dark:text-[#FFFFFF99] text-[#00000099] mb-4">
              Current Upgrade Plan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={plan.name} />
              <InfoItem label="Height" value={plan.height} />
              <InfoItem label="Info" value={plan.info} />
              <InfoItem
                label="Time"
                value={plan.time ? new Date(plan.time).toLocaleString() : 'N/A'}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-row justify-center gap-2 w-full">
          <button
            type="button"
            className="btn w-1/2 focus:outline-none dark:bg-[#FFFFFF0F] bg-[#0000000A] dark:text-white text-black"
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn w-1/2 btn-gradient text-white"
            onClick={() => handleCancelUpgrade()}
            disabled={isSigning}
          >
            {isSigning ? <span className="loading loading-dots"></span> : 'Cancel Upgrade'}
          </button>
        </div>

        <SignModal />
      </Dialog.Panel>
    </Dialog>
  );
}

import { chainName } from '@/config';
import { useFeeEstimation, useTx } from '@/hooks';
import { cosmos, strangelove_ventures } from '@liftedinit/manifestjs';
import { Any } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/any';
import { MsgRemoveValidator } from '@liftedinit/manifestjs/dist/codegen/strangelove_ventures/poa/v1/tx';
import { useChain } from '@cosmos-kit/react';
import React, { useEffect, useState } from 'react';
import { PiWarning } from 'react-icons/pi';

interface WarningModalProps {
  admin: string;
  isActive: boolean;
  address: string;
  moniker: string;
  modalId: string;
  openWarningModal: boolean;
  setOpenWarningModal: (open: boolean) => void;
}

export function WarningModal({
  admin,
  moniker,
  modalId,
  address,
  isActive,
  openWarningModal,
  setOpenWarningModal,
}: Readonly<WarningModalProps>) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openWarningModal) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openWarningModal]);

  const { tx, isSigning, setIsSigning } = useTx(chainName);
  const { estimateFee } = useFeeEstimation(chainName);
  const { address: userAddress } = useChain(chainName);
  const { removePending, removeValidator } =
    strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;
  const { submitProposal } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const handleAccept = async () => {
    setIsSigning(true);
    const msgRemoveActive = removeValidator({
      sender: admin ?? '',
      validatorAddress: address,
    });

    const msgRemovePending = removePending({
      sender: admin ?? '',
      validatorAddress: address,
    });

    const anyMessage = Any.fromPartial({
      typeUrl: isActive ? msgRemoveActive.typeUrl : msgRemovePending.typeUrl,
      value: isActive
        ? MsgRemoveValidator.encode(msgRemoveActive.value).finish()
        : MsgRemoveValidator.encode(msgRemovePending.value).finish(),
    });

    const groupProposalMsg = submitProposal({
      groupPolicyAddress: admin,
      messages: [anyMessage],
      metadata: '',
      proposers: [userAddress ?? ''],
      title: `Remove ${isActive ? 'Active' : 'Pending'} Validator ${moniker}`,
      summary: `Proposal to remove ${moniker} from the ${isActive ? 'active' : 'pending'} set.`,
      exec: 0,
    });

    const fee = await estimateFee(userAddress ?? '', [groupProposalMsg]);
    await tx([groupProposalMsg], {
      fee,
      onSuccess: () => {
        setIsSigning(false);
      },
    });
    setIsSigning(false);
  };

  const handleClose = () => {
    if (setOpenWarningModal) {
      setOpenWarningModal(false);
    }
    (document.getElementById(modalId) as HTMLDialogElement)?.close();
  };

  return (
    <dialog
      id={modalId}
      className={`modal ${openWarningModal ? 'modal-open' : ''}`}
      onClose={handleClose}
    >
      <form
        method="dialog"
        className="modal-box text-black dark:text-white dark:bg-[#1D192D] bg-[#FFFFFF]"
      >
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleClose}
        >
          ✕
        </button>
        <div className="p-4 ">
          <div className="flex flex-col gap-2 items-center mb-6">
            <PiWarning className="text-yellow-200 text-6xl" />
          </div>
          <p className="text-md text-center font-thin">
            Are you sure you want to remove the validator{' '}
          </p>
          <p className="text-center font-bold text-2xl mt-2">{moniker}</p>
          <p className="text-md text-center font-thin mt-2">
            from the {isActive ? 'active set' : 'pending list'}?
          </p>
        </div>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-error text-white w-1/2 mx-auto -mt-2"
            onClick={handleAccept}
            disabled={isSigning}
          >
            {isSigning ? (
              <span className="loading loading-dots loading-sm"></span>
            ) : isActive ? (
              'Remove From Active Set'
            ) : (
              'Remove From Pending List'
            )}
          </button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
}

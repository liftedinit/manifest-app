import { useFeeEstimation } from '@/hooks';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@liftedinit/manifestjs';
import { useChain } from '@cosmos-kit/react';
import React, { useState } from 'react';
import { CloseIcon } from '@/components/icons';
import env from '@/config/env';
import { Dialog } from '@headlessui/react';
import SignModal from '@/components/react/authSignerModal';
import { ProposalSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';

function VotingPopup({
  open,
  onClose,
  proposal,
  refetch,
}: {
  open: boolean;
  onClose: () => void;
  proposal?: ProposalSDKType;
  refetch: () => void;
}) {
  const { estimateFee } = useFeeEstimation(env.chain);
  const { tx, isSigning, setIsSigning } = useTx(env.chain);
  const { address } = useChain(env.chain);
  const [error, setError] = useState<string | null>(null);

  const { vote } = cosmos.group.v1.MessageComposer.withTypeUrl;

  if (!proposal) return null;

  const handleVote = async (option: number) => {
    setIsSigning(true);
    const msg = vote({
      proposalId: proposal.id,
      voter: address ?? '',
      option: option,
      metadata: '',
      exec: 0,
    });

    const fee = await estimateFee(address ?? '', [msg]);
    try {
      await tx(
        [msg],
        {
          fee,
          onSuccess: () => {
            refetch();
            closeModal();
            setIsSigning(false);
          },
        },
        'votingPrompt'
      );
    } catch (error) {
      console.error('Failed to vote: ', error);
      setError('Failed to cast vote. Please try again.');
      setIsSigning(false);
    }
  };

  const closeModal = () => onClose();

  return (
    <Dialog
      open={open}
      onClose={closeModal}
      aria-label="vote-modal"
      id="vote_modal"
      className="modal modal-open fixed flex p-0 m-0 top-0 right-0 z-[9999]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <Dialog.Panel className="modal-box m-auto relative dark:bg-[#1D192D] bg-[#FFFFFF]">
        <h3 className="font-bold text-lg mb-4">
          Cast Your Vote for Proposal #{proposal.id.toString()}
        </h3>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <div className="grid w-full grid-cols-2 gap-4">
          {isSigning ? (
            <div className="loading loading-dots loading-sm" />
          ) : (
            <>
              <button onClick={() => handleVote(1)} className="btn btn-success">
                Yes
              </button>
              <button onClick={() => handleVote(3)} className="btn btn-error">
                No
              </button>
              <button onClick={() => handleVote(4)} className="btn btn-warning">
                No With Veto
              </button>
              <button onClick={() => handleVote(2)} className="btn btn-info">
                Abstain
              </button>
            </>
          )}
        </div>
        <div className="modal-action ">
          <button
            className="btn btn-sm absolute top-2 right-2 btn-circle btn-ghost"
            onClick={closeModal}
          >
            <CloseIcon className="w-2 h-2" />
          </button>
        </div>
      </Dialog.Panel>

      <SignModal id="votingPrompt" />
    </Dialog>
  );
}

export default VotingPopup;

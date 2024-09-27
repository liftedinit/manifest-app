import { useFeeEstimation } from '@/hooks';
import { useTx } from '@/hooks/useTx';
import { cosmos } from '@chalabi/manifestjs';
import { useChain } from '@cosmos-kit/react';
import React, { useState } from 'react';

function VotingPopup({ proposalId, refetch }: { proposalId: bigint; refetch: () => void }) {
  const { estimateFee } = useFeeEstimation('manifest');
  const { tx } = useTx('manifest');
  const { address } = useChain('manifest');
  const [error, setError] = useState<string | null>(null);

  const { vote } = cosmos.group.v1.MessageComposer.withTypeUrl;

  console.log('VotingPopup - proposalId:', proposalId);

  const handleVote = async (option: number) => {
    console.log('Handling vote for proposal:', proposalId, 'with option:', option);
    const msg = vote({
      proposalId: proposalId,
      voter: address ?? '',
      option: option,
      metadata: '',
      exec: 0,
    });
    console.log('Vote message:', msg);
    const fee = await estimateFee(address ?? '', [msg]);
    try {
      await tx([msg], {
        fee,
        onSuccess: () => {
          refetch();
          closeModal();
        },
      });
    } catch (error) {
      console.error('Failed to vote: ', error);
      setError('Failed to cast vote. Please try again.');
    }
  };

  const closeModal = () => {
    const modal = document.getElementById('vote_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  return (
    <>
      <dialog id="vote_modal" className="modal modal-bottom  sm:modal-middle">
        <form method="dialog" className="modal-box dark:bg-[#1D192D] bg-[#FFFFFF]">
          <h3 className="font-bold text-lg mb-4">
            Cast Your Vote for Proposal #{proposalId.toString()}
          </h3>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <div className="grid w-full grid-cols-2 gap-4">
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
          </div>
          <div className="modal-action">
            <button className="btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export default VotingPopup;

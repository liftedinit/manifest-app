import { useTx } from "@/hooks/useTx";
import { cosmos } from "@chalabi/manifestjs";
import { useChain } from "@cosmos-kit/react";
import React from "react";

function VotingPopup({
  proposalId,
  isGridVisible,
}: {
  proposalId: bigint;
  isGridVisible: boolean;
}) {
  const { tx, Toast, toastMessage, setToastMessage } = useTx("manifest");
  const { address } = useChain("manifest");

  const { vote } = cosmos.group.v1.MessageComposer.withTypeUrl;

  const fee = {
    amount: [
      {
        denom: "umfx",
        amount: "0.0001",
      },
    ],
    gas: "200000",
  };

  const handleVote = async (option: number) => {
    const msg = vote({
      proposal_id: proposalId,
      voter: address ?? "",
      option: option,
      metadata: "",
      exec: 0,
    });
    try {
      await tx([msg], {
        fee,
        onSuccess: () => {},
      });
    } catch (error) {
      console.error("Failed to vote: ", error);
    }
  };

  return (
    <>
      <Toast toastMessage={toastMessage} setToastMessage={setToastMessage} />
      <div
        className={`mx-auto w-full bg-base-300 p-4 rounded-md border-r-4 border-r-base-200 border-b-4 border-b-base-200 absolute flex justify-center items-center bottom-14 mb-2 ${
          isGridVisible ? "animate-fadeSlideUp" : "animate-fadeSlideDown"
        } transition-opacity duration-300`}
      >
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
      </div>
    </>
  );
}

export default VotingPopup;

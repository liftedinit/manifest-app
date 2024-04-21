import {
  ExtendedQueryGroupsByMemberResponseSDKType,
  useProposalsByPolicyAccount,
  useTallyCount,
  useVotesByProposal,
} from "@/hooks/useQueries";
import { GroupDetailsModal } from "../modals/groupDetailsModal";
import ProfileAvatar from "@/utils/identicon";
import VoteDetailsModal from "../modals/voteDetailsModal";
import { QueryTallyResultResponseSDKType } from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/query";
import {
  MemberSDKType,
  ProposalSDKType,
} from "@chalabi/manifestjs/dist/codegen/cosmos/group/v1/types";
import Link from "next/link";
import { truncateString } from "@/utils";

export function Proposals({
  groups,
  groupByMemberDataLoading,
  groupByMemberDataError,
}: {
  groups: ExtendedQueryGroupsByMemberResponseSDKType;
  groupByMemberDataLoading: boolean;
  groupByMemberDataError: Error | null | boolean;
}) {
  const renderSkeleton = () => (
    <>
      <div className="py-8">
        <div className="skeleton rounded-md mx-auto h-16 w-5/6"></div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col rounded-md bg-base-100 shadow w-full p-4">
      <div className="w-full rounded-md min-h-36 max-h-96">
        <div className="px-4 py-5 justify-between  items-center border-b border-gray-200">
          <h3 className="text-lg  font-bold leading-6">Proposals</h3>
        </div>
        <div className="overflow-y-auto mt-2 mb-2">
          {groupByMemberDataLoading ? renderSkeleton() : null}
          {groups?.groups?.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex flex-row px-4 justify-between py-2 items-center bg-base-300 rounded-t-md ">
                <div className="flex flex-row items-center">
                  <ProfileAvatar walletAddress={group.admin ?? ""} />
                  <h4 className="text-lg font-medium mt-1 ml-4 hidden md:block">
                    {group.ipfsMetadata?.title}
                  </h4>
                  <h4 className="text-lg font-medium mt-1 ml-4 md:hidden block ">
                    {truncateString(group.ipfsMetadata?.title ?? "", 30)}
                  </h4>
                </div>
                <Link
                  href={`/groups/submit-proposal/${group.policies[0].address}`}
                  passHref
                >
                  <button className="relative inline-flex items-center btn btn-xs btn-primary">
                    New proposal
                  </button>
                </Link>
              </div>

              {group.policies?.map((policy, policyIndex) => (
                <div key={policyIndex} className="mb-4">
                  <div className="px-4 bg-base-300/30 rounded-b-md mb-2 ">
                    <ProposalsForPolicy
                      admin={group.admin}
                      policyAddress={policy.address}
                      members={group.members}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
          {!groupByMemberDataLoading &&
            !groupByMemberDataError &&
            groups?.groups?.length === 0 && (
              <div className="text-center mt-6">No groups found</div>
            )}
        </div>
      </div>
    </div>
  );
}

function Modal({
  proposalId,
  members,
  proposal,
  admin,
}: {
  proposalId: bigint;
  members: MemberSDKType[];
  proposal: ProposalSDKType;
  admin: string;
}) {
  const { tally, isTallyLoading, isTallyError } = useTallyCount(proposalId);

  const { votes } = useVotesByProposal(proposalId);

  return (
    <VoteDetailsModal
      admin={admin}
      members={members}
      tallies={tally ?? ({} as QueryTallyResultResponseSDKType)}
      votes={votes}
      proposal={proposal}
      modalId={`vote_modal_${proposal?.id}`}
    />
  );
}

function ProposalsForPolicy({
  policyAddress,
  members,
  admin,
}: {
  policyAddress: string;
  members: MemberSDKType[];
  admin: string;
}) {
  const { proposals, isProposalsLoading, isProposalsError } =
    useProposalsByPolicyAccount(policyAddress);

  return (
    <div>
      {isProposalsLoading ? (
        <div className="py-2">Loading proposals...</div>
      ) : isProposalsError ? (
        <div className="py-2">Error loading proposals</div>
      ) : (
        <div className="overflow-y-auto max-h-40">
          {proposals?.map((proposal, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-1 w-full  py-2"
            >
              <div>
                <h3 className="text-md font-medium">
                  <span>#{proposal.id.toString()}</span>{" "}
                  {proposal.title || "Untitled Proposal"}
                </h3>
              </div>
              <button
                className=" btn btn-primary btn-xs"
                onClick={() =>
                  (
                    document.getElementById(
                      `vote_modal_${proposal?.id}`
                    ) as HTMLDialogElement
                  )?.showModal()
                }
              >
                Info
              </button>
              <Modal
                admin={admin}
                proposalId={proposal.id}
                members={members}
                proposal={proposal}
              />
            </div>
          ))}
          {proposals?.length === 0 && (
            <div className="py-2">No proposals found</div>
          )}
        </div>
      )}
    </div>
  );
}

import { QueryTallyResultResponseSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/query';
import {
  ProposalSDKType,
  ProposalStatus,
  ThresholdDecisionPolicySDKType,
  proposalStatusToJSON,
} from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/types';
import {
  ProposalExecutorResult,
  proposalExecutorResultToJSON,
} from 'cosmjs-types/cosmos/group/v1/types';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import VoteDetailsModal from '@/components/groups/modals/voteDetailsModal';
import { ExtendedGroupType, useMultipleTallyCounts } from '@/hooks';

function isProposalPassing(tally: QueryTallyResultResponseSDKType, policyThreshold: number) {
  const yesCount = BigInt(tally?.tally?.yes_count ?? '0');
  const noCount = BigInt(tally?.tally?.no_count ?? '0');
  const noWithVetoCount = BigInt(tally?.tally?.no_with_veto_count ?? '0');
  const abstainCount = BigInt(tally?.tally?.abstain_count ?? '0');

  const totalVotes = yesCount + noCount + noWithVetoCount + abstainCount;
  const totalNoVotes = noCount + noWithVetoCount;

  // Check if threshold is reached
  const threshold = BigInt(policyThreshold);
  const isThresholdReached = totalVotes >= threshold;

  // Check for tie
  const isTie = yesCount === totalNoVotes && yesCount > 0;

  // Determine if passing based on vote distribution
  const isPassing = isThresholdReached && yesCount > totalNoVotes;

  return {
    isPassing,
    yesCount,
    noCount,
    noWithVetoCount,
    abstainCount,
    isThresholdReached,
    isTie,
  };
}

function getHumanReadableType(type: string): string {
  const parts = type.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart
    .replace('Msg', '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

export interface GroupProposalsProps {
  group: ExtendedGroupType;
  proposals: ProposalSDKType[];
}

export const GroupProposals = ({ group, proposals }: GroupProposalsProps) => {
  const { tallies } = useMultipleTallyCounts(proposals.map(p => p.id));

  return (
    <>
      <table
        className="table w-full border-separate border-spacing-y-3 -mt-6"
        aria-label="Group proposals"
      >
        <thead>
          <tr className="text-sm font-medium">
            <th className="bg-transparent px-4 py-2 w-[25%]" scope="col">
              ID
            </th>
            <th className="bg-transparent px-4 py-2 w-[25%]" scope="col">
              Title
            </th>
            <th className="bg-transparent px-4 py-2 w-[25%] hidden xl:table-cell" scope="col">
              Time Left
            </th>
            <th
              className="bg-transparent px-4 py-2 w-[25%] sm:table-cell md:hidden hidden xl:table-cell"
              scope="col"
            >
              Type
            </th>
            <th
              className="bg-transparent px-4 py-2 w-[25%] sm:table-cell xxs:hidden hidden 2xl:table-cell"
              scope="col"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {proposals.map(proposal => (
            <ProposalRow
              key={`proposal-${proposal.id}`}
              group={group}
              proposal={proposal}
              tally={tallies.find(t => t.proposalId === proposal.id)?.tally}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};

const ProposalRow = ({
  group,
  proposal,
  tally,
}: {
  group: ExtendedGroupType;
  proposal: ProposalSDKType;
  tally?: QueryTallyResultResponseSDKType;
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { proposalId } = router.query;
    if (proposalId === proposal.id.toString()) {
      setShowVoteModal(true);
    }
  }, [router.query, proposal]);

  const policyAddress = group.policies[0]?.address ?? '';
  const policyThreshold =
    (group.policies[0]?.decision_policy as ThresholdDecisionPolicySDKType)?.threshold ?? '0';

  const endTime = new Date(proposal?.voting_period_end);
  const now = new Date();
  const msPerMinute = 1000 * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const diff = endTime.getTime() - now.getTime();

  let timeLeft: string;

  if (diff <= 0) {
    timeLeft = 'none';
  } else if (diff >= msPerDay) {
    const days = Math.floor(diff / msPerDay);
    timeLeft = `${days} day${days === 1 ? '' : 's'}`;
  } else if (diff >= msPerHour) {
    const hours = Math.floor(diff / msPerHour);
    timeLeft = `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (diff >= msPerMinute) {
    const minutes = Math.floor(diff / msPerMinute);
    timeLeft = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    timeLeft = 'less than a minute';
  }

  let status = 'Pending';
  // We need to compare strings here
  if (
    proposal.executor_result.toString() ===
    proposalExecutorResultToJSON(ProposalExecutorResult.PROPOSAL_EXECUTOR_RESULT_FAILURE)
  ) {
    status = 'Failure';
  } else if (
    proposal.status.toString() === proposalStatusToJSON(ProposalStatus.PROPOSAL_STATUS_ACCEPTED)
  ) {
    status = 'Execute';
  } else if (tally) {
    const { isPassing, isThresholdReached, isTie } = isProposalPassing(
      tally,
      Number.parseInt(policyThreshold) || 0
    );
    if (isThresholdReached) {
      if (isTie) {
        status = 'Tie';
      } else {
        status = isPassing ? 'Passing' : 'Failing';
      }
    }
  }

  return (
    <>
      <tr
        key={proposal.id.toString()}
        onClick={() => {
          setShowVoteModal(true);
          // Update URL without navigating
          router.push(
            `/groups?policyAddress=${policyAddress}&proposalId=${proposal.id}`,
            undefined,
            {
              shallow: true,
            }
          );
        }}
        className="group text-black dark:text-white rounded-lg cursor-pointer"
      >
        <td className="bg-secondary group-hover:bg-base-300 rounded-l-[12px] px-4 py-4 w-[25%]">
          {proposal.id.toString()}
        </td>
        <td
          className={`bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] sm:rounded-none xxs:rounded-r-[12px] xs:rounded-r-[12px] xl:rounded-r-none`}
        >
          {proposal.title}
        </td>
        <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] hidden xl:table-cell">
          {timeLeft}
        </td>
        <td className="bg-secondary group-hover:bg-base-300 px-4 py-4 w-[25%] sm:table-cell md:hidden hidden xl:table-cell ">
          {proposal.messages.length > 0
            ? getHumanReadableType((proposal.messages[0] as any)['@type'])
            : 'No messages'}
        </td>
        <td className="bg-secondary group-hover:bg-base-300 rounded-r-[12px] sm:table-cell xxs:hidden hidden 2xl:table-cell">
          {!tally ? <span className="loading loading-spinner loading-xs"></span> : status}

          {
            // Show vote modal if the proposal is selected, cannot be outside `<tr>`.
            showVoteModal && (
              <VoteDetailsModal
                policyAddress={policyAddress}
                proposalId={proposal.id}
                onClose={() => {
                  setShowVoteModal(false);
                  const query = { ...router.query };
                  delete query.proposalId;
                  router.push(
                    {
                      pathname: router.pathname,
                      query,
                    },
                    undefined,
                    { shallow: true }
                  );
                }}
                showVoteModal={showVoteModal}
              />
            )
          }
        </td>
      </tr>
    </>
  );
};

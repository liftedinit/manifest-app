import { useChain } from '@cosmos-kit/react';
import Link from 'next/link';
import React from 'react';

import { GroupsIcon, IfWalletConnected, WalletNotConnected } from '@/components';
import { SEO } from '@/components';
import YourGroups from '@/components/groups/components/myGroups';
import env from '@/config/env';
import { useGroupsByMember, useProposalsByPolicyAccountAll } from '@/hooks';

export default function Groups() {
  const { address } = useChain(env.chain);
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError } = useGroupsByMember(
    address ?? ''
  );

  const groupPolicyAddresses =
    groupByMemberData?.groups?.map(group => group.policies[0].address) ?? [];

  const { proposalsByPolicyAccount, isProposalsError, isProposalsLoading } =
    useProposalsByPolicyAccountAll(groupPolicyAddresses ?? []);

  const isLoading = isGroupByMemberLoading || isProposalsLoading;
  const isError = isGroupByMemberError || isProposalsError;

  return (
    <div className="min-h-screen relative lg:py-0 py-4 px-2 mx-auto text-white ">
      <SEO title="Groups - Alberto" />

      <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          <IfWalletConnected icon={GroupsIcon} message="start interacting with your groups">
            {isLoading ? (
              <YourGroups
                groups={groupByMemberData ?? { groups: [] }}
                proposals={proposalsByPolicyAccount}
                isLoading={isLoading}
              />
            ) : isError ? (
              <div className="text-center text-error">Error loading groups or proposals</div>
            ) : groupByMemberData?.groups.length === 0 ? (
              <NoGroupsFound />
            ) : (
              <YourGroups
                groups={groupByMemberData ?? { groups: [] }}
                proposals={proposalsByPolicyAccount}
                isLoading={isLoading}
              />
            )}
          </IfWalletConnected>
        </div>
      </div>
    </div>
  );
}

function NoGroupsFound() {
  return (
    <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            No Groups Found
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            You are not a member of any groups yet. Create a new group to get started!
          </p>
          <Link href="/groups/create" passHref>
            <button className="btn btn-gradient">Create a New Group</button>
          </Link>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <GroupsIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}

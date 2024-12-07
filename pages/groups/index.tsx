import { WalletNotConnected } from '@/components';
import { YourGroups } from '@/components/groups/components/myGroups';
import { GroupInfo } from '@/components/groups/modals/groupInfo';
import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { chainName } from '../../config';
import { useGroupsByMember, useProposalsByPolicyAccountAll } from '../../hooks/useQueries';
import { GroupsIcon } from '@/components';

export default function Groups() {
  const { address, isWalletConnected } = useChain(chainName);
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError, refetchGroupByMember } =
    useGroupsByMember(address ?? '');

  const [selectedPolicyAddress, _setSelectedPolicyAddress] = useState<string | null>(null);

  const groupPolicyAddresses =
    groupByMemberData?.groups?.map(group => group.policies[0].address) ?? [];

  const { proposalsByPolicyAccount, isProposalsError, isProposalsLoading, refetchProposals } =
    useProposalsByPolicyAccountAll(groupPolicyAddresses ?? []);

  const isLoading = isGroupByMemberLoading || isProposalsLoading;
  const isError = isGroupByMemberError || isProposalsError;

  return (
    <div className="min-h-screen relative py-4 px-2 mx-auto text-white ">
      <Head>
        <title>Groups - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Groups - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Groups - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Groups - Alberto',
            description: 'Alberto is the gateway to the Manifest Network',
            url: 'https://',
            image: 'https://',
            publisher: {
              '@type': 'Organization',
              name: 'Chandra Station',
              logo: {
                '@type': 'ImageObject',
                url: 'https:///img/logo.png',
              },
            },
          })}
        </script>
      </Head>
      <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected
              description="Use the button below to connect your wallet and start interacting with your groups."
              icon={<GroupsIcon className="h-60 w-60 text-primary" />}
            />
          ) : isLoading ? (
            <YourGroups
              groups={groupByMemberData ?? { groups: [] }}
              proposals={proposalsByPolicyAccount}
              isLoading={isLoading}
              refetch={refetchGroupByMember || refetchProposals}
            />
          ) : isError ? (
            <div className="text-center text-error">Error loading groups or proposals</div>
          ) : groupByMemberData?.groups.length === 0 ? (
            <NoGroupsFound />
          ) : (
            <>
              <YourGroups
                groups={groupByMemberData ?? { groups: [] }}
                proposals={proposalsByPolicyAccount}
                isLoading={isLoading}
                refetch={refetchGroupByMember || refetchProposals}
              />
            </>
          )}
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

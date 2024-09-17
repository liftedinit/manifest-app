import { WalletSection } from '@/components';
import { YourGroups } from '@/components/groups/components/myGroups';
import { GroupInfo } from '@/components/groups/components/groupInfo';
import { useChain } from '@cosmos-kit/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { chainName } from '../../config';
import { useGroupsByMember, useProposalsByPolicyAccountAll } from '../../hooks/useQueries';

export default function Groups() {
  const { address, isWalletConnected } = useChain(chainName);
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError, refetchGroupByMember } =
    useGroupsByMember(address ?? '');

  const [selectedPolicyAddress, setSelectedPolicyAddress] = useState<string | null>(null);

  const handleGroupSelect = (policyAddress: string) => {
    setSelectedPolicyAddress(policyAddress);
  };

  const groupPolicyAddresses =
    groupByMemberData?.groups?.map(group => group.policies[0].address) ?? [];

  const { proposalsByPolicyAccount, isProposalsError, isProposalsLoading } =
    useProposalsByPolicyAccountAll(groupPolicyAddresses ?? []);

  return (
    <div className="flex flex-col min-h-screen">
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
      <div className="flex-grow">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected />
          ) : (
            <>
              <YourGroups
                groups={groupByMemberData}
                proposals={proposalsByPolicyAccount}
                onSelectGroup={handleGroupSelect}
              />
              {selectedPolicyAddress && (
                <GroupInfo
                  policyAddress={selectedPolicyAddress}
                  proposals={proposalsByPolicyAccount[selectedPolicyAddress]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletNotConnected() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="mb-4">Connect your wallet to view and manage your groups.</p>
        <WalletSection chainName={chainName} />
      </div>
    </div>
  );
}

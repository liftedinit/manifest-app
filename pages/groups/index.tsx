import { WalletSection } from "@/components";
import { GroupInfo } from "@/components/groups/components/groupInfo";
import ProposalsForPolicy from "@/components/groups/components/groupProposals";
import { YourGroups } from "@/components/groups/components/myGroups";
import Notifications from "@/components/groups/components/Notifications";
import { useChain } from "@cosmos-kit/react";

import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { chainName } from "../../config";
import {
  useGroupsByMember,
  useProposalsByPolicyAccount,
  useProposalsByPolicyAccountAll,
} from "../../hooks/useQueries";
import Ably from "ably";
export default function Groups() {
  const { address, isWalletConnected } = useChain(chainName);
  const {
    groupByMemberData,
    isGroupByMemberLoading,
    isGroupByMemberError,
    refetchGroupByMember,
  } = useGroupsByMember(address ?? "");

  const [selectedPolicyAddress, setSelectedPolicyAddress] = useState<
    string | null
  >(null);

  const handleGroupSelect = (policyAddress: string) => {
    setSelectedPolicyAddress(policyAddress);
  };

  const infoGroup = groupByMemberData?.groups?.find(
    (group) => group?.policies[0]?.address === selectedPolicyAddress
  );

  const groupPolicyAddresses =
    groupByMemberData?.groups?.map((group) => group.policies[0].address) ?? [];

  const { proposalsByPolicyAccount, isProposalsError, isProposalsLoading } =
    useProposalsByPolicyAccountAll(groupPolicyAddresses ?? []);

  // const proposal = {
  //   title: "New Proposal",
  //   description: "This is a new proposal",
  //   createdAt: new Date().toISOString(),
  // };

  // const handleAbly = async () => {
  //   if (!selectedPolicyAddress) return;
  //   const ably = new Ably.Realtime(
  //     process.env.NEXT_PUBLIC_ABLY_API_KEY as string
  //   );
  //   const channel = ably.channels.get(
  //     `[?rewind=24h]group-${selectedPolicyAddress}`
  //   );
  //   await channel.publish("new-proposal", proposal);
  // };
  return (
    <>
      <div className="max-w-5xl relative py-[2rem] mx-auto lg:mx-auto ">
        {/* <Notifications groupPolicyAddress={selectedPolicyAddress ?? ""} />
        <button onClick={handleAbly} className="btn btn-primary">
          Notify
        </button> */}
        <Head>
          <title>Groups - Alberto</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta
            name="description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta
            name="keywords"
            content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
          />
          <meta name="author" content="Chandra Station" />
          <link rel="icon" href="/favicon.ico" />

          <meta property="og:title" content="Groups - Alberto" />
          <meta
            property="og:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta property="og:url" content="https://" />
          <meta property="og:image" content="https://" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Alberto" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Groups - Alberto" />
          <meta
            name="twitter:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta name="twitter:image" content="https://" />
          <meta name="twitter:site" content="@" />

          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Groups - Alberto",
              description: "Alberto is the gateway to the Manifest Network",
              url: "https://",
              image: "https://",
              publisher: {
                "@type": "Organization",
                name: "Chandra Station",
                logo: {
                  "@type": "ImageObject",
                  url: "https:///img/logo.png",
                },
              },
            })}
          </script>
        </Head>
        <div className="-ml-4 -mt-2 flex items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              Groups
            </h3>
            <h3 className="tracking-tight px-4 leading-none text-4xl xl:text-4xl md:hidden block">
              Groups
            </h3>
          </div>
          {groupByMemberData?.groups?.length >= 1 && isWalletConnected && (
            <Link href="/groups/create" passHref>
              <button className="relative items-center btn btn-primary hidden md:inline-flex">
                Create New Group
              </button>
            </Link>
          )}
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col  lg:flex-row md:flex-col sm:flex-col xs:flex-col rounded-md bg-base-300 blur-40 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected && (
            <section className=" transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md  mx-auto lg:gap-8 xl:gap-0  lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl ">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl t">
                    Use the button below to connect your wallet and start
                    interacting with your groups.
                  </p>
                  <WalletSection chainName="manifest" />
                </div>
                <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                  <img src="/groups.svg" alt="groups" />
                </div>
              </div>
            </section>
          )}
          {!isGroupByMemberLoading && groupByMemberData.groups.length === 0 && (
            <section className=" transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md border-r-base-300 border-r-8 border-b-8 border-b-base-300 mx-auto lg:gap-8 xl:gap-0  lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl ">
                    On chain governance for collobrative decision making
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl t">
                    Groups are sets of members who can submit and vote on
                    proposals together. Proposals are composed of any message
                    type. Create your first group and get started.
                  </p>
                  <Link href="/groups/create" passHref>
                    <button className="mt-6 btn btn-primary btn-lg inline-flex items-center">
                      Create A Group
                    </button>
                  </Link>
                </div>
                <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                  <img src="/groups.svg" alt="groups" />
                </div>
              </div>
            </section>
          )}
          {isGroupByMemberLoading && isWalletConnected && (
            <div className="flex flex-col gap-4 w-full  mx-auto justify-center  items-center transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="flex flex-row w-full h-[46rem]  gap-4 ">
                <div className="skeleton h-full w-1/3"></div>
                <div className="skeleton h-full w-2/3"></div>
              </div>
              <div className="skeleton h-full w-full"></div>
            </div>
          )}
          {groupByMemberData?.groups?.length >= 1 &&
            !isGroupByMemberLoading &&
            isWalletConnected && (
              <div className="flex flex-col w-full">
                <div className=" flex flex-col md:flex-row sm:flex-col xs:flex-col w-full gap-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
                  <div className="flex flex-col justify-start items-center lg:w-1/3 md:w-full">
                    <YourGroups
                      refetchGroupByMember={refetchGroupByMember}
                      groups={groupByMemberData}
                      groupByMemberDataLoading={isGroupByMemberLoading}
                      groupByMemberDataError={isGroupByMemberError}
                      onSelectGroup={handleGroupSelect}
                      proposals={proposalsByPolicyAccount}
                    />
                  </div>

                  <div className="flex flex-col justify-start gap-4 items-start  lg:w-2/3 md:w-full">
                    <GroupInfo
                      refetchGroupByMember={refetchGroupByMember}
                      group={infoGroup}
                      groupByMemberDataLoading={isGroupByMemberLoading}
                      groupByMemberDataError={isGroupByMemberError}
                      address={address ?? ""}
                      policyAddress={selectedPolicyAddress ?? ""}
                    />
                  </div>
                </div>
                <ProposalsForPolicy
                  policyAddress={selectedPolicyAddress ?? ""}
                />
                {groupByMemberData?.groups?.length >= 1 &&
                  isWalletConnected && (
                    <Link href="/groups/create" passHref>
                      <button className="relative items-center btn btn-primary block md:hidden w-full mt-6 mb-2">
                        Create New Group
                      </button>
                    </Link>
                  )}
              </div>
            )}
        </div>
      </div>
    </>
  );
}

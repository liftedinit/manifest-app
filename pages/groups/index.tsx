import { WalletSection } from "@/components";
import { Proposals } from "@/components/groups/components/groupInfo";
import ProposalsForPolicy from "@/components/groups/components/groupProposals";
import { YourGroups } from "@/components/groups/components/myGroups";
import { useChain } from "@cosmos-kit/react";

import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { chainName } from "../../config";
import {
  useGroupsByMember,
  useProposalsByPolicyAccount,
} from "../../hooks/useQueries";

export default function Home() {
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
    (group) => group.policies[0].address === selectedPolicyAddress
  );

  return (
    <>
      <div className="max-w-5xl relative py-[2rem] mx-auto lg:mx-auto ">
        <Head>
          <title>Groups</title>
          <meta name="description" content="Interact with the groups module" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="-ml-4 -mt-2 flex items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              groups
            </h3>
          </div>
          {groupByMemberData?.groups?.length >= 1 && isWalletConnected && (
            <Link href="/groups/create" passHref>
              <button className="relative inline-flex items-center btn btn-primary">
                create new group
              </button>
            </Link>
          )}
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col  md:flex-row sm:flex-col xs:flex-col rounded-md bg-base-200/20 blur-40 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected && (
            <section className=" transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md border-r-base-300 border-r-8 border-b-8 border-b-base-300 mx-auto lg:gap-8 xl:gap-0  lg:grid-cols-12">
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
                    />
                  </div>

                  <div className="flex flex-col justify-start gap-4 items-start  lg:w-2/3 md:w-full">
                    <Proposals
                      refetchGroupByMember={refetchGroupByMember}
                      group={infoGroup}
                      groupByMemberDataLoading={isGroupByMemberLoading}
                      groupByMemberDataError={isGroupByMemberError}
                    />
                  </div>
                </div>
                <ProposalsForPolicy
                  policyAddress={selectedPolicyAddress ?? ""}
                />
              </div>
            )}
        </div>
      </div>
    </>
  );
}

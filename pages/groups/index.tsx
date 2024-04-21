import { Proposals } from "@/components/groups/components/proposals";
import { YourGroups } from "@/components/groups/components/yourGroups";
import { useChain } from "@cosmos-kit/react";

import Head from "next/head";
import Link from "next/link";
import { chainName } from "../../config";
import {
  useGroupsByMember,
  useProposalsByPolicyAccount,
} from "../../hooks/useQueries";

export default function Home() {
  const { address } = useChain(chainName);
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError } =
    useGroupsByMember(address ?? "");

  return (
    <>
      <div className="max-w-5xl py-24 mx-auto lg:mx-auto">
        <Head>
          <title>Cosmos Web App Template</title>
          <meta name="description" content="Cosmos web app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="-ml-4 -mt-2 flex items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none md:text-4xl xl:text-4xl">
              Groups
            </h3>
          </div>
          <Link href="/groups/create" passHref>
            <button className="relative inline-flex items-center btn btn-primary">
              Create new group
            </button>
          </Link>
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col rounded-md bg-base-200 shadow-lg ">
          <div className="flex justify-center gap-4 items-start    w-3xl h-2xl">
            <YourGroups
              groups={groupByMemberData}
              groupByMemberDataLoading={isGroupByMemberLoading}
              groupByMemberDataError={isGroupByMemberError}
            />
            <YourGroups
              groups={groupByMemberData}
              groupByMemberDataLoading={isGroupByMemberLoading}
              groupByMemberDataError={isGroupByMemberError}
            />
          </div>
          <Proposals
            groups={groupByMemberData}
            groupByMemberDataLoading={isGroupByMemberLoading}
            groupByMemberDataError={isGroupByMemberError}
          />
        </div>
      </div>
    </>
  );
}

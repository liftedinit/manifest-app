import { YourGroups } from "@/components/groups/components/yourGroups";
import { useChain } from "@cosmos-kit/react";

import Head from "next/head";
import Link from "next/link";
import { chainName } from "../../config";
import { useGroupsByMember } from "../../hooks/useQueries";

export default function Home() {
  const { address } = useChain(chainName);
  const { groupByMemberData, isGroupByMemberLoading, isGroupByMemberError } =
    useGroupsByMember(address ?? "");

  console.log(groupByMemberData, isGroupByMemberLoading, isGroupByMemberError);

  return (
    <>
      <div
        data-theme="cupcake"
        className="max-w-5xl  py-24 mx-auto justify-center items-center lg:mx-auto"
      >
        <Head>
          <title>Cosmos Web App Template</title>
          <meta name="description" content="cosmos web app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none md:text-4xl xl:text-4xl">
              Groups
            </h3>
          </div>
          <div className="ml-4 mt-2 flex-shrink-0">
            <Link href={"/groups/create"} passHref legacyBehavior>
              <button className="relative inline-flex items-center btn btn-accent">
                Create new group
              </button>
            </Link>
          </div>
        </div>
        <YourGroups
          groups={groupByMemberData}
          groupByMemberDataLoading={isGroupByMemberLoading}
          groupByMemberDataError={isGroupByMemberError}
        />
      </div>
    </>
  );
}

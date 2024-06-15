import { WalletSection } from "@/components";
import { ParamsSDKType as PoaParamType } from "@chalabi/manifestjs/dist/codegen/strangelove_ventures/poa/v1/params";
import { useChain } from "@cosmos-kit/react";
import ValidatorList from "@/components/admins/components/validatorList";
import Head from "next/head";
import React from "react";
import AdminOptions from "@/components/admins/components/adminOptions";
import StakingParams from "@/components/admins/components/stakingParams";
import {
  useGroupsByAdmin,
  usePendingValidators,
  usePoaParams,
  useStakingParams,
  useValidators,
} from "@/hooks";
import {
  ParamsSDKType,
  ValidatorSDKType,
} from "@chalabi/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking";
import { PiWarning } from "react-icons/pi";
import { strangelove_ventures } from "@chalabi/manifestjs";

export default function Admins() {
  const { address, isWalletConnected } = useChain("manifest");
  const { poaParams, isPoaParamsLoading, refetchPoaParams } = usePoaParams();
  const {
    pendingValidators,
    isPendingValidatorsLoading,
    refetchPendingValidators,
  } = usePendingValidators();
  const { stakingParams, isParamsLoading, refetchParams } = useStakingParams();
  const { validators, isActiveValidatorsLoading, refetchActiveValidatorss } =
    useValidators();

  const { groupByAdmin, isGroupByAdminLoading, refetchGroupByAdmin } =
    useGroupsByAdmin(
      "manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj"
    );
  const group = groupByAdmin?.groups?.[0];

  const isMember = group?.members?.some(
    (member) => member?.member?.address === address
  );

  const { updateParams } =
    strangelove_ventures.poa.v1.MessageComposer.withTypeUrl;

  const msgUpdateParams = updateParams({
    sender: address ?? "",
    params: {
      admins: [
        "manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj",
      ],
      allow_validator_self_exit: true,
    },
  });

  return (
    <>
      <div className="max-w-5xl relative py-8 mx-auto">
        <Head>
          <title>Admins - Alberto</title>
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

          <meta property="og:title" content="Admins - Alberto" />
          <meta
            property="og:description"
            content="Alberto is the gateway to the Manifest Network"
          />
          <meta property="og:url" content="https://" />
          <meta property="og:image" content="https://" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Alberto" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Admins - Alberto" />
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
              name: "Admins - Alberto",
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
        <div className="flex items-center justify-between flex-wrap -ml-4 -mt-2 sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="tracking-tight leading-none text-4xl xl:text-4xl md:block hidden">
              Admins
            </h3>
            <h3 className="tracking-tight px-4 leading-none text-4xl xl:text-4xl md:hidden block">
              Admins
            </h3>
          </div>
        </div>
        <div className="mt-6 p-4 gap-4 flex flex-col lg:flex-row rounded-md bg-base-300 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          {!isWalletConnected ? (
            <section className="transition-opacity duration-300 ease-in-out animate-fadeIn w-full">
              <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl">
                    Connect your wallet!
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    Use the button below to connect your wallet and start
                    changing parameters as an admin.
                  </p>
                  <WalletSection chainName="manifest" />
                </div>
                <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                  <img src="/admin.svg" alt="groups" className="h-60 w-60" />
                </div>
              </div>
            </section>
          ) : !isActiveValidatorsLoading && !isMember ? (
            <div className="flex flex-col w-full bg-base-100 rounded-md p-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
              <div className="flex flex-col w-full h-full gap-4">
                <PiWarning className="text-6xl mx-auto text-red-500" />
                <a className="text-4xl mx-auto">Access Denied</a>
                <p className="text-lg mx-auto text-center max-w-prose">
                  You do not have permission to view this page. Only proof of
                  authority administrators or members of a group that is a proof
                  of authority admin may access this page.
                </p>
              </div>
            </div>
          ) : (
            isMember &&
            isWalletConnected && (
              <div className="flex flex-col w-full">
                <div className="flex flex-col sm:flex-col w-full gap-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
                  <div className="flex flex-col gap-4 justify-between items-center w-full">
                    <ValidatorList
                      isLoading={
                        isActiveValidatorsLoading || isPendingValidatorsLoading
                      }
                      activeValidators={
                        validators ?? ({} as ValidatorSDKType[])
                      }
                      pendingValidators={
                        pendingValidators ?? ({} as ValidatorSDKType[])
                      }
                    />
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
                      <AdminOptions
                        group={group}
                        poaParams={poaParams ?? ({} as PoaParamType)}
                        isLoading={isPoaParamsLoading || isGroupByAdminLoading}
                      />
                      <StakingParams
                        isLoading={isParamsLoading}
                        stakingParams={stakingParams ?? ({} as ParamsSDKType)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

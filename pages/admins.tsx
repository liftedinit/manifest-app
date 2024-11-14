import { WalletSection } from '@/components';
import { useChain } from '@cosmos-kit/react';
import ValidatorList from '@/components/admins/components/validatorList';
import Head from 'next/head';
import React, { useState } from 'react';

import { useGroupsByAdmin, usePendingValidators, usePoaGetAdmin, useValidators } from '@/hooks';
import { ValidatorSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { PiWarning } from 'react-icons/pi';
import { AdminsIcon } from '@/components/icons';
import { SearchIcon } from '@/components/icons';
export default function Admins() {
  const { address, isWalletConnected } = useChain('manifest');
  const { poaAdmin, isPoaAdminLoading } = usePoaGetAdmin();
  const { pendingValidators, isPendingValidatorsLoading } = usePendingValidators();
  const { validators, isActiveValidatorsLoading } = useValidators();
  const [active, setActive] = useState(true);
  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(
    poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );

  const group = groupByAdmin?.groups?.[0];

  const isMember = group?.members?.some(member => member?.member?.address === address);
  console.log(group, groupByAdmin, isMember);
  return (
    <div className="min-h-screen relative py-4 px-2 mx-auto text-white mt-12 md:mt-0">
      <Head>
        <title>Admins - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Admins - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Admins - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Admins - Alberto',
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
      <div className="gap-6 flex flex-col w-full lg:flex-row transition-opacity duration-300 ease-in-out animate-fadeIn">
        {!isWalletConnected ? (
          <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
            <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                  Connect your wallet!
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                  Use the button below to connect your wallet and access the admin features.
                </p>
                <div className="w-full lg:w-[50%]">
                  <WalletSection chainName="manifest" />
                </div>
              </div>
              <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                <AdminsIcon className="h-60 w-60 text-primary" />
              </div>
            </div>
          </section>
        ) : isGroupByAdminLoading || isActiveValidatorsLoading ? (
          <section className="transition-opacity duration-300 min-h-screen ease-in-out animate-fadeIn w-full">
            <div className="">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
                <h2
                  className="text-black dark:text-white"
                  style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
                >
                  Validators
                </h2>
                <div className="relative w-[224px]">
                  <input
                    type="text"
                    placeholder="Search for a validator..."
                    className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-[#0000000A] dark:bg-[#FFFFFF1F] pl-10 text-[#161616] dark:text-white placeholder-[#00000099] dark:placeholder-[#FFFFFF99]"
                    disabled
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00000099] dark:text-[#FFFFFF99]" />
                </div>
              </div>
            </div>
            <div className="flex mb-6 w-full  h-[3.5rem] rounded-xl p-1 bg-[#0000000A] dark:bg-[#FFFFFF0F]">
              <button
                onClick={() => setActive(true)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-colors ${
                  active
                    ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
                    : 'text-[#808080]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActive(false)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-colors ${
                  !active
                    ? 'dark:bg-[#FFFFFF1F] bg-[#FFFFFF] text-[#161616] dark:text-white'
                    : 'text-[#808080]'
                }`}
              >
                Pending
              </button>
            </div>
            <div className="w-full mx-auto mt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-base-200 p-4 rounded-[12px] flex items-center space-x-4"
                  >
                    <div className="skeleton h-12 w-12 rounded-full"></div>
                    <div className="flex-grow space-y-2">
                      <div className="skeleton h-4 w-full"></div>
                      <div className="skeleton h-4 w-3/4"></div>
                    </div>
                    <div className="skeleton h-8 w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : !isMember ? (
          <section className="transition-opacity duration-300 h-[78vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
            <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                  Access Denied
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                  You do not have permission to view this page. Only proof of authority
                  administrators or members of a group that is a proof of authority admin may access
                  this page.
                </p>
              </div>
              <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
                <PiWarning className="h-60 w-60 text-red-500" />
              </div>
            </div>
          </section>
        ) : (
          isMember &&
          isWalletConnected && (
            <ValidatorList
              isLoading={isActiveValidatorsLoading || isPendingValidatorsLoading}
              activeValidators={validators ?? ([] as ValidatorSDKType[])}
              pendingValidators={pendingValidators ?? ([] as ValidatorSDKType[])}
              admin={
                poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
              }
            />
          )
        )}
      </div>
    </div>
  );
}

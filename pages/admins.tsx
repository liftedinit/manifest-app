import { WalletNotConnected, WalletSection } from '@/components';
import { useChain } from '@cosmos-kit/react';
import ValidatorList from '@/components/admins/components/validatorList';
import Head from 'next/head';
import React, { useState } from 'react';

import { useGroupsByAdmin, usePendingValidators, usePoaGetAdmin, useValidators } from '@/hooks';
import { ValidatorSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { PiWarning } from 'react-icons/pi';
import { AdminsIcon } from '@/components/icons';

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
    <div className="min-h-screen relative py-4 px-2 mx-auto text-white ">
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
      <div className="flex-grow h-full animate-fadeIn h-screen transition-all duration-300">
        <div className="w-full mx-auto">
          {!isWalletConnected ? (
            <WalletNotConnected
              description={
                'Use the button below to connect your wallet and access the admin features.'
              }
              icon={<AdminsIcon className="h-60 w-60 text-primary" />}
            />
          ) : isGroupByAdminLoading || isPendingValidatorsLoading ? (
            <div className="flex flex-col items-center justify-center h-screen">
              <div className="mb-4 text-xl font-semibold text-primary">Checking permission...</div>
              <div className="loading w-[8rem] loading-ring text-primary"></div>
            </div>
          ) : !isMember ? (
            <section className="transition-opacity duration-300 h-[78vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
              <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
                <div className="mr-auto place-self-center lg:col-span-7">
                  <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
                    Access Denied
                  </h1>
                  <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    You do not have permission to view this page. Only proof of authority
                    administrators or members of a group that is a proof of authority admin may
                    access this page.
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
    </div>
  );
}

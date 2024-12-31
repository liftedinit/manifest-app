import { WalletNotConnected } from '@/components';
import { useChain } from '@cosmos-kit/react';
import ValidatorList from '@/components/admins/components/validatorList';
import Head from 'next/head';
import React from 'react';

import { useGroupsByAdmin, usePendingValidators, usePoaGetAdmin, useValidators } from '@/hooks';
import { ValidatorSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/staking/v1beta1/staking';
import { PiWarning } from 'react-icons/pi';
import { AdminsIcon } from '@/components/icons';
import { StakeHolderPayout, ChainUpgrader } from '@/components/admins/components';
import env from '@/config/env';
import { SEO } from '@/components';
export default function Admins() {
  const { address, isWalletConnected } = useChain(env.chain);
  const { poaAdmin } = usePoaGetAdmin();
  const { pendingValidators, isPendingValidatorsLoading } = usePendingValidators();
  const { validators, isActiveValidatorsLoading } = useValidators();

  const { groupByAdmin, isGroupByAdminLoading } = useGroupsByAdmin(
    poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );

  const group = groupByAdmin?.groups?.[0];

  const isMember = group?.members?.some(member => member?.member?.address === address);

  return (
    <div className="min-h-screen relative lg:py-0 py-4 px-2 mx-auto text-white ">
      <SEO title="Admins - Alberto" />
      <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
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
              <>
                <ValidatorList
                  isLoading={isActiveValidatorsLoading || isPendingValidatorsLoading}
                  activeValidators={validators ?? ([] as ValidatorSDKType[])}
                  pendingValidators={pendingValidators ?? ([] as ValidatorSDKType[])}
                  admin={
                    poaAdmin ??
                    'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
                  }
                />
                <div className="w-full h-full justify-between items-center flex flex-col md:flex-row mt-4  gap-4">
                  <StakeHolderPayout
                    admin={
                      poaAdmin ??
                      'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
                    }
                    address={address ?? ''}
                  />
                  <ChainUpgrader
                    address={address ?? ''}
                    admin={
                      poaAdmin ??
                      'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
                    }
                  />
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useReducer } from 'react';
import { tokenFormDataReducer, TokenFormData } from '@/helpers/formReducer';

import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import TokenDetails from '@/components/factory/forms/TokenDetailsForm';

import { Duration } from '@chalabi/manifestjs/dist/codegen/google/protobuf/duration';
import StepIndicator from '@/components/groups/components/StepIndicator';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '@/config';
import { WalletSection } from '@/components';
import Success from '@/components/factory/forms/Success';
import Head from 'next/head';
import CreateDenom from '@/components/factory/forms/CreateDenom';
const initialFormData: TokenFormData = {
  subdenom: '',
  symbol: '',
  label: '',
  description: '',
  uri: '',
  display: '',
  exponent: '',
  base: '',
  name: '',
  uriHash: '',
  denomUnits: [],
};

export default function CreateToken() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, dispatch] = useReducer(tokenFormDataReducer, initialFormData);
  const { address } = useChain(chainName);
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { isWalletConnected } = useChain(chainName);

  const steps = [
    { label: 'Create Denom', step: 1 },
    { label: 'Token Metadata', step: 2 },
    { label: 'Confirmation', step: 3 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Head>
        <title>Create token - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Create a token - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create a token - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Create a token - Alberto',
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
      {!isWalletConnected && (
        <div className="mt-24 p-4 gap-4 flex flex-col max-w-5xl  lg:flex-row md:flex-col sm:flex-col xs:flex-col rounded-md bg-base-200/20 blur-40 shadow-lg transition-opacity duration-300 ease-in-out animate-fadeIn">
          <section className=" transition-opacity duration-300 ease-in-out animate-fadeIn">
            <div className="grid max-w-screen-xl bg-base-100 p-12 rounded-md  mx-auto lg:gap-8 xl:gap-0  lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl ">
                  Connect your wallet!
                </h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl text-balance">
                  Use the button below to connect your wallet and create a token.
                </p>
                <WalletSection chainName={chainName} />
              </div>
              <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                <img src="/factory.svg" alt="groups" className="h-60 w-60" />
              </div>
            </div>
          </section>
        </div>
      )}
      {isWalletConnected && (
        <div className="w-full flex flex-col gap-12 justify-between my-auto items-center animate-fadeIn max-w-4xl mt-10">
          {currentStep != 4 && <StepIndicator steps={steps} currentStep={currentStep} />}
          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <CreateDenom
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <TokenDetails
                address={address ?? ''}
                formData={formData}
                dispatch={dispatch}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ConfirmationForm
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 4 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <Success formData={formData} address={address ?? ''} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useReducer } from 'react';
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
import { FactoryIcon } from '@/components/icons';

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
    <div className="flex flex-col items-center min-h-screen w-full">
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
      {!isWalletConnected ? (
        <WalletNotConnected />
      ) : (
        <div className="w-full justify-between space-y-8 min-h-screen items-center animate-fadeIn mt-4 overflow-hidden">
          {currentStep != 4 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn mx-auto">
              <CreateDenom formData={formData} dispatch={dispatch} nextStep={nextStep} />
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

function WalletNotConnected() {
  return (
    <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            Connect your wallet!
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            Use the button below to connect your wallet and start creating new tokens.
          </p>
          <div className="w-[50%]">
            <WalletSection chainName="manifest" />
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <FactoryIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}

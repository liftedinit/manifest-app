import React, { useState, useReducer, useEffect } from 'react';
import { tokenFormDataReducer, TokenFormData } from '@/helpers/formReducer';
import ConfirmationForm from '@/components/factory/forms/ConfirmationForm';
import TokenDetails from '@/components/factory/forms/TokenDetailsForm';
import StepIndicator from '@/components/react/StepIndicator';
import { useChain } from '@cosmos-kit/react';
import { WalletNotConnected } from '@/components';
import Success from '@/components/factory/forms/Success';
import Head from 'next/head';
import CreateDenom from '@/components/factory/forms/CreateDenom';
import { FactoryIcon } from '@/components/icons';
import env from '@/config/env';
import { useRouter } from 'next/router';

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
  isGroup: false,
  groupPolicyAddress: '',
};

export default function CreateToken() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, dispatch] = useReducer(tokenFormDataReducer, initialFormData);
  const { address, isWalletConnected } = useChain(env.chain);
  const router = useRouter();

  useEffect(() => {
    const { isGroup, groupPolicyAddress } = router.query;
    if (isGroup) {
      // Use the parameter as needed, for example, set it in the form data
      dispatch({ type: 'UPDATE_FIELD', field: 'isGroup', value: isGroup });
    }
    if (groupPolicyAddress) {
      dispatch({ type: 'UPDATE_FIELD', field: 'groupPolicyAddress', value: groupPolicyAddress });
    }
  }, [router.query]);

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

  const steps = [
    { label: 'Create Denom', mobileLabel: 'Denom', step: 1 },
    { label: 'Token Metadata', mobileLabel: 'Metadata', step: 2 },
    { label: 'Confirmation', mobileLabel: 'Confirm', step: 3 },
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
        <WalletNotConnected
          description="Use the button below to connect your wallet and start creating new tokens."
          icon={<FactoryIcon className="h-60 w-60 text-primary" />}
        />
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

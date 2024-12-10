import React, { useState, useReducer } from 'react';
import { formDataReducer, FormData } from '@/helpers/formReducer';
import ConfirmationForm from '@/components/groups/forms/groups/ConfirmationForm';
import GroupDetails from '@/components/groups/forms/groups/GroupDetailsForm';
import GroupPolicyForm from '@/components/groups/forms/groups/GroupPolicyForm';
import MemberInfoForm from '@/components/groups/forms/groups/MemberInfoForm';
import { Duration } from '@liftedinit/manifestjs/dist/codegen/google/protobuf/duration';
import StepIndicator from '@/components/react/StepIndicator';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '@/config';
import { WalletNotConnected, WalletSection } from '@/components';
import Success from '@/components/groups/forms/groups/Success';
import Head from 'next/head';
import { GroupsIcon } from '@/components';

const initialFormData: FormData = {
  title: '',
  authors: '',
  description: '',
  votingPeriod: {} as Duration,
  votingThreshold: '',
  members: [{ address: '', name: '', weight: '' }],
};

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, dispatch] = useReducer(formDataReducer, initialFormData);
  const { address } = useChain(chainName);

  const nextStep = () => {
    if (currentStep < 5) {
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
    { label: 'Details', step: 1 },
    { label: 'Members', step: 2 },
    { label: 'Policy', step: 3 },
    { label: 'Confirmation', step: 4 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen w-full ">
      <Head>
        <title>Create a group - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Create a group - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create a group - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Create a group - Alberto',
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
          description="Use the button below to connect your wallet and create a group."
          icon={<GroupsIcon className="h-60 w-60 text-primary" />}
        />
      ) : (
        <div className="w-full justify-between space-y-8 min-h-screen items-center animate-fadeIn mt-4 overflow-hidden">
          {currentStep != 5 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn  mx-auto">
              <GroupDetails
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <MemberInfoForm
                address={address ?? ''}
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <GroupPolicyForm
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}
          {currentStep === 4 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ConfirmationForm
                address={address ?? ''}
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 5 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <Success address={address ?? ''} formData={formData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useReducer } from 'react';
import { useRouter } from 'next/router';
import StepIndicator from '@/components/groups/components/StepIndicator';
import ConfirmationForm from '@/components/groups/forms/proposals/ConfirmationForm';
import ProposalDetails from '@/components/groups/forms/proposals/ProposalDetailsForm';
import ProposalMetadataForm from '@/components/groups/forms/proposals/ProposalMetadataForm';
import ProposalMessages from '@/components/groups/forms/proposals/ProposalMessages';
import { ProposalFormData, proposalFormDataReducer } from '@/helpers/formReducer';
import Head from 'next/head';
import { chainName } from '@/config';
import { useChain } from '@cosmos-kit/react';
import Success from '@/components/groups/forms/proposals/SuccessForm';
import { WalletSection } from '@/components';
import { FaVoteYea } from 'react-icons/fa';

export default function SubmitProposal() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { policyAddress } = router.query;
  const { address, isWalletConnected } = useChain(chainName);
  const initialProposalFormData: ProposalFormData = {
    title: '',
    proposers: '',
    summary: '',
    messages: [
      {
        type: 'send',
        from_address: '',
        to_address: '',
        amount: {
          denom: '',
          amount: '',
        },
      },
    ],
    metadata: {
      title: '',
      authors: '',
      summary: '',
      details: '',
    },
  };

  const [formData, dispatch] = useReducer(proposalFormDataReducer, initialProposalFormData);

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

  const steps = [
    { label: 'Info', step: 1 },
    { label: 'Messages', step: 2 },
    { label: 'Metadata', step: 3 },
    {
      label: (
        <>
          <span className="hidden sm:inline">Confirmation</span>
          <span className="sm:hidden">Confirm</span>
        </>
      ),
      step: 4,
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Head>
        <title>Submit a proposal - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Alberto is the gateway to the Manifest Network" />
        <meta
          name="keywords"
          content="crypto, blockchain, application, Cosmos-SDK, Alberto, Manifest Network"
        />
        <meta name="author" content="Chandra Station" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Submit a proposal - Alberto" />
        <meta property="og:description" content="Alberto is the gateway to the Manifest Network" />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Submit a proposal - Alberto" />
        <meta name="twitter:description" content="Alberto is the gateway to the Manifest Network" />
        <meta name="twitter:image" content="https://" />
        <meta name="twitter:site" content="@" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Submit a proposal - Alberto',
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
          {currentStep != 5 && <StepIndicator steps={steps} currentStep={currentStep} />}

          {currentStep === 1 && (
            <div className="transition-opacity duration-300 animate-fadeIn w-full">
              <ProposalDetails
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                address={address ?? ''}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ProposalMessages
                policyAddress={policyAddress as string}
                address={address as string}
                formData={formData}
                dispatch={dispatch}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <ProposalMetadataForm
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
                policyAddress={policyAddress as string}
                formData={formData}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            </div>
          )}
          {currentStep === 5 && (
            <div className="transition-opacity duration-300 animate-fadeIn">
              <Success formData={formData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WalletNotConnected() {
  return (
    <section className="transition-opacity duration-300 h-[80vh] ease-in-out animate-fadeIn w-full flex items-center justify-center overflow-hidden">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl">
            Connect your wallet!
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            Use the button below to connect your wallet and submit a proposal.
          </p>
          <div className="w-[50%]">
            <WalletSection chainName={chainName} />
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <FaVoteYea className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}

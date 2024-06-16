import React, { useState, useReducer } from "react";
import { useRouter } from "next/router";
import StepIndicator from "@/components/groups/components/StepIndicator";
import ConfirmationForm from "@/components/groups/forms/proposals/ConfirmationForm";
import ProposalDetails from "@/components/groups/forms/proposals/ProposalDetailsForm";
import ProposalMetadataForm from "@/components/groups/forms/proposals/ProposalMetadataForm";
import ProposalMessages from "@/components/groups/forms/proposals/ProposalMessages";
import {
  ProposalFormData,
  proposalFormDataReducer,
  ProposalAction,
} from "@/helpers/formReducer";
import Head from "next/head";
import { chainName } from "@/config";
import { useChain } from "@cosmos-kit/react";

export default function SubmitProposal() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { policyAddress } = router.query;
  const { address } = useChain(chainName);
  const initialProposalFormData: ProposalFormData = {
    title: "",
    proposers: "",
    summary: "",
    messages: [
      {
        type: "send",
        from_address: "",
        to_address: "",
        amount: {
          denom: "",
          amount: "",
        },
      },
    ],
    metadata: {
      title: "",
      authors: "",
      summary: "",
      details: "",
    },
  };

  const [formData, dispatch] = useReducer(
    proposalFormDataReducer,
    initialProposalFormData
  );

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
    { label: "Info", step: 1 },
    { label: "Messages", step: 2 },
    { label: "Metadata", step: 3 },
    { label: "Confirmation", step: 4 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Head>
        <title>Submit a proposal - Alberto</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

        <meta property="og:title" content="Submit a proposal - Alberto" />
        <meta
          property="og:description"
          content="Alberto is the gateway to the Manifest Network"
        />
        <meta property="og:url" content="https://" />
        <meta property="og:image" content="https://" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Alberto" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Submit a proposal - Alberto" />
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
            name: "Submit a proposal - Alberto",
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
      <div className="w-full flex flex-col gap-12 justify-between my-auto items-center animate-fadeIn max-w-4xl mt-10">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {currentStep === 1 && (
          <div className="transition-opacity duration-300 animate-fadeIn">
            <ProposalDetails
              formData={formData}
              dispatch={dispatch}
              nextStep={nextStep}
              address={address ?? ""}
            />
          </div>
        )}
        {currentStep === 2 && (
          <div className="transition-opacity duration-300 animate-fadeIn">
            <ProposalMessages
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
              policyAddress={policyAddress as string}
              formData={formData}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          </div>
        )}
      </div>
    </div>
  );
}

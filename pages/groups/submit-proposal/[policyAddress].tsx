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

export default function SubmitProposal() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { policyAddress } = router.query;

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
      <div className="w-full flex flex-col gap-12 justify-between my-auto items-center animate-fadeIn max-w-4xl mt-10">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {currentStep === 1 && (
          <div className="transition-opacity duration-300 animate-fadeIn">
            <ProposalDetails
              formData={formData}
              dispatch={dispatch}
              nextStep={nextStep}
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
              dispatch={dispatch}
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

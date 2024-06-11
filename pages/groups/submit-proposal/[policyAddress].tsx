import React, { useState, useEffect, useReducer } from "react";
import ConfirmationForm from "@/components/groups/forms/proposals/ConfirmationForm";
import ProposalDetails from "@/components/groups/forms/proposals/ProposalDetailsForm";
import ProposalMetadataForm from "@/components/groups/forms/proposals/ProposalMetadataForm";
import ProposalMessages from "@/components/groups/forms/proposals/ProposalMessages";
import { useRouter } from "next/router";
import {
  ProposalFormData,
  proposalFormDataReducer,
  ProposalAction,
} from "@/helpers/formReducer"; // Make sure to define the reducer and initial state in a separate file

export default function SubmitProposal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animation, setAnimation] = useState("opacity-0");
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

  console.log(formData);

  useEffect(() => {
    setAnimation("opacity-50");

    const timeoutId = setTimeout(
      () =>
        setAnimation(
          "opacity-100 translate-y-0 transition-opacity duration-300"
        ),
      10
    );
    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < 4) {
      animateOut(() => setCurrentStep(currentStep + 1));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      animateOut(() => setCurrentStep(currentStep - 1));
    }
  };

  const animateOut = (callback: () => void) => {
    setAnimation("opacity-50 transition-opacity duration-300");
    setTimeout(callback, 200);
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${animation}`}
    >
      {currentStep === 1 && (
        <ProposalDetails
          formData={formData}
          dispatch={dispatch}
          nextStep={nextStep}
        />
      )}
      {currentStep === 2 && (
        <ProposalMessages
          formData={formData}
          dispatch={dispatch}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 3 && (
        <ProposalMetadataForm
          formData={formData}
          dispatch={dispatch}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 4 && (
        <ConfirmationForm
          dispatch={dispatch}
          policyAddress={policyAddress as string}
          formData={formData}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      )}
    </div>
  );
}

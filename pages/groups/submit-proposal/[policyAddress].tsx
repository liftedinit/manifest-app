import React, { useState, useEffect } from "react";
import ConfirmationForm from "@/components/groups/forms/proposals/ConfirmationForm";
import ProposalDetails from "@/components/groups/forms/proposals/ProposalDetailsForm";
import ProposalMetadataForm from "@/components/groups/forms/proposals/ProposalMetadataForm";
import ProposalMessages from "@/components/groups/forms/proposals/ProposalMessages";
import { useRouter } from "next/router";
import { Coin } from "@cosmjs/stargate";

export default function CreateGroup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animation, setAnimation] = useState("opacity-0");
  const router = useRouter();
  const { policyAddress } = router.query;

  const [formData, setFormData] = useState({
    title: "",
    proposers: "",
    summary: "",
    messages: [
      {
        from_address: "",
        to_address: "",
        amount: {
          denom: "",
          amount: "",
        },
        isVisible: false,
      },
    ],
    metadata: {
      title: "",
      authors: "",
      summary: "",
      details: "",
    },
  });

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

  const handleDataChange = (newData: {
    title: string;
    proposers: string;
    summary: string;
    messages: {
      from_address: string;
      to_address: string;
      amount: {
        denom: string;
        amount: string;
      };
      isVisible: boolean;
    }[];
    metadata: {
      title: string;
      authors: string;
      summary: string;
      details: string;
    };
  }) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const animateOut = (callback: { (): void; (): void; (): void }) => {
    setAnimation("opacity-50  transition-opacity duration-300");
    setTimeout(callback, 200);
  };

  return (
    <div
      className={`flex justify-center items-center min-h-screen ${animation}`}
    >
      {currentStep === 1 && (
        <ProposalDetails
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
        />
      )}
      {currentStep === 2 && (
        <ProposalMessages
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 3 && (
        <ProposalMetadataForm
          formData={formData}
          onDataChange={handleDataChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {currentStep === 4 && (
        <ConfirmationForm
          policyAddress={policyAddress as string}
          formData={formData}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      )}
    </div>
  );
}
